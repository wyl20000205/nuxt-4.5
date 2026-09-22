import { randomUUID } from "node:crypto"
import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createError, getRouterParam, readMultipartFormData } from "h3"
import { getBlogImageDirectory, getBlogImageExtension } from "../../../utils/blogImages"
import { requireBlogUser } from "../../../utils/blogSession"
import { isValidPostEdit } from "../../../utils/postEdit"
import { userSql } from "../../../utils/user/sql"

export default defineEventHandler(async (event) => {
  const user = await requireBlogUser(event)
  const postId = Number(getRouterParam(event, "id"))
  if (!Number.isSafeInteger(postId) || postId < 1) {
    throw createError({ statusCode: 400, message: "帖子参数无效" })
  }

  const parts = (await readMultipartFormData(event)) ?? []
  const textPart = parts.find((part) => part.name === "text" && !part.filename)
  const keptPart = parts.find((part) => part.name === "keepImages" && !part.filename)
  const uploads = parts.filter((part) => part.name === "images" && part.filename)
  let keptImages: unknown
  try {
    keptImages = JSON.parse(keptPart?.data.toString("utf8") ?? "")
  } catch {
    throw createError({ statusCode: 400, message: "图片参数无效" })
  }
  const text = textPart?.data.toString("utf8").trim()
  if (text === undefined || text.length > 5000 || uploads.length > 9) {
    throw createError({ statusCode: 400, message: "帖子内容或图片数量无效" })
  }

  const current = await userSql.findEditablePost(user.id, postId)
  if (!current) throw createError({ statusCode: 404, message: "帖子不存在" })
  const currentImages = Array.isArray(current.images)
    ? current.images.filter((image): image is string => typeof image === "string")
    : []
  if (!isValidPostEdit(text, keptImages, currentImages, uploads.length)) {
    throw createError({ statusCode: 400, message: "帖子内容或图片参数无效" })
  }

  const extensions = uploads.map(({ data }) => getBlogImageExtension(data))
  if (uploads.some(({ data }, index) => !extensions[index] || data.length > 10 * 1024 * 1024)) {
    throw createError({ statusCode: 400, message: "仅支持 10MB 内的 JPG、PNG、WebP、GIF 图片" })
  }
  const directory = getBlogImageDirectory()
  const names = extensions.map((extension) =>
    `${user.id}_${randomUUID().replaceAll("-", "")}${extension}`,
  )
  const written: string[] = []
  try {
    if (uploads.length) await mkdir(directory, { recursive: true })
    for (const [index, upload] of uploads.entries()) {
      const name = names[index]!
      written.push(name)
      await writeFile(join(directory, name), upload.data)
    }
    const images = [...keptImages, ...names]
    const post = await userSql.updatePost(user.id, postId, text, currentImages, images)
    if (!post) throw createError({ statusCode: 409, message: "帖子已被修改，请刷新后重试" })

    const removed = currentImages.filter((image) => !images.includes(image))
    await Promise.all(removed.map(async (image) => {
      if (!/^[\w-]+\.(png|jpg|webp|gif)$/.test(image)) return
      try {
        await rm(join(directory, image), { force: true })
      } catch (error) {
        console.error("[Post] 清理旧图片失败:", error)
      }
    }))
    return { post: { id: post.id, text: post.text || "", images } }
  } catch (error) {
    await Promise.allSettled(written.map((name) => rm(join(directory, name), { force: true })))
    throw error
  }
})
