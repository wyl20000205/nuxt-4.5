import { createError, getCookie, type H3Event } from "h3"
import { verifyBlogSession } from "./blogAuth"
import { getPrisma } from "./prisma"

export async function requireBlogUser(event: H3Event) {
  const prisma = getPrisma(event)
  const token = getCookie(event, "blog_session") || ""
  const userId = Number(token.split(".")[0])
  const user = Number.isSafeInteger(userId) && userId > 0
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
      })
    : undefined

  if (!user || verifyBlogSession(token, user.password) !== user.id) {
    throw createError({ statusCode: 401, message: "请先登录" })
  }

  return { id: user.id }
}
