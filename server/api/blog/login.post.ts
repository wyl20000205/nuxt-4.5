import { createError, readBody, setCookie } from "h3"
import {
  createBlogSession,
  hashBlogPassword,
  verifyBlogPasswordHash,
} from "../../utils/blogAuth"
import { getDatabase } from "../../utils/db"

type UserRow = {
  id: number
  password: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: unknown }>(event)
  if (typeof body?.password !== "string" || body.password.length > 256) {
    throw createError({ statusCode: 400, message: "请输入有效密钥" })
  }

  const passwordHash = hashBlogPassword(body.password)
  const user = getDatabase()
    .prepare("SELECT id, password FROM t_user WHERE password = ?")
    .get(passwordHash) as UserRow | undefined

  if (!user || !verifyBlogPasswordHash(passwordHash, user.password)) {
    throw createError({ statusCode: 401, message: "密钥错误" })
  }

  setCookie(event, "blog_session", createBlogSession(user.id, user.password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return { ok: true, userId: user.id }
})
