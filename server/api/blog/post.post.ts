import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createError, getCookie, readMultipartFormData } from "h3"
import { verifyBlogSession } from "../../utils/blogAuth"
import { getBlogImageDirectory } from "../../utils/blogImages"
import { getDatabase } from "../../utils/db"

type UserRow = { id: number; password: string }

const imageTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "blog_session") || ""
  const tokenUserId = Number(token.split(".")[0])
  const database = getDatabase()
  const user = Number.isSafeInteger(tokenUserId)
    ? (database
        .prepare("SELECT id, password FROM t_user WHERE id = ?")
        .get(tokenUserId) as UserRow | undefined)
    : undefined

  if (!user || verifyBlogSession(token, user.password) !== user.id) {
    throw createError({ statusCode: 401, message: "请先登录" })
  }

  const parts = (await readMultipartFormData(event)) || []
  const text =
    parts
      .find(({ name, filename }) => name === "text" && !filename)
      ?.data.toString("utf8")
      .trim() || ""
  const images = parts.filter(({ name, filename }) => name === "images" && filename)

  if (!text && images.length === 0) {
    throw createError({ statusCode: 400, message: "帖子内容不能为空" })
  }
  if (text.length > 5000 || images.length > 9) {
    throw createError({ statusCode: 400, message: "文字或图片数量超出限制" })
  }
  if (
    images.some(
      ({ type, data }) => !type || !imageTypes[type] || data.length > 10 * 1024 * 1024,
    )
  ) {
    throw createError({
      statusCode: 400,
      message: "仅支持 10MB 内的 JPG、PNG、WebP、GIF 图片",
    })
  }

  const imageDirectory = getBlogImageDirectory()
  await mkdir(imageDirectory, { recursive: true })
  const existingNames = await readdir(imageDirectory)
  const imageNamePattern = new RegExp(`^${user.id}_(\\d+)\\.[^.]+$`)
  const firstImageIndex =
    existingNames.reduce((max, name) => {
      const index = Number(name.match(imageNamePattern)?.[1])
      return Number.isSafeInteger(index) ? Math.max(max, index) : max
    }, -1) + 1
  // ponytail: assumes one publisher; reserve indexes in SQLite if concurrent posting is added.
  const imageNames = images.map(
    ({ type }, index) =>
      `${user.id}_${firstImageIndex + index}${imageTypes[type!]}`,
  )

  try {
    await Promise.all(
      images.map(({ data }, index) =>
        writeFile(join(imageDirectory, imageNames[index]!), data),
      ),
    )
    const time = Date.now()
    const result = database
      .prepare("INSERT INTO t_post (user_id, text, img, time) VALUES (?, ?, ?, ?)")
      .run(user.id, text, JSON.stringify(imageNames), time)

    return {
      post: {
        id: Number(result.lastInsertRowid),
        user_id: user.id,
        text,
        img_list: imageNames,
        time,
      },
    }
  } catch (error) {
    await Promise.all(
      imageNames.map((name) => rm(join(imageDirectory, name), { force: true })),
    )
    throw error
  }
})
