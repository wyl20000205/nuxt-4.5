import { createError, getMethod, getRouterParam } from "h3"
import { indexSql } from "../../../../utils/index/sql"
import { requireBlogUser } from "../../../../utils/blogSession"

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== "PUT" && method !== "DELETE") {
    throw createError({ statusCode: 405, message: "请求方法无效" })
  }
  const postId = Number(getRouterParam(event, "id"))
  if (!Number.isSafeInteger(postId) || postId < 1) {
    throw createError({ statusCode: 400, message: "帖子 ID 无效" })
  }
  const user = await requireBlogUser(event)
  const state = await indexSql.setLike(postId, user.id, method === "PUT")
  if (!state) throw createError({ statusCode: 404, message: "帖子不存在" })
  return state
})
