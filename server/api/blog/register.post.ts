import { createError, readBody, setCookie } from "h3"
import { createBlogSession, hashBlogPassword } from "../../utils/blogAuth"
import { indexSql } from "../../utils/index/sql"

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: unknown }>(event)
  if (
    typeof body?.password !== "string" ||
    body.password.length < 8 ||
    body.password.length > 256
  ) {
    throw createError({ statusCode: 400, message: "密钥长度应为 8 至 256 个字符" })
  }

  const user = await indexSql.register(hashBlogPassword(body.password))
  if (user === "duplicate") {
    throw createError({ statusCode: 409, message: "该密钥已注册" })
  }
  if (user === "frequent") {
    throw createError({ statusCode: 429, message: "注册频繁，请 30 秒后重试" })
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
