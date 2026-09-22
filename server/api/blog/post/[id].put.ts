import { createError, getRouterParam } from "h3"
import { adminSql } from "../../../utils/admin/sql"
import { requireBlogAdmin } from "../../../utils/blogSession"

export default defineEventHandler(async (event) => {
  await requireBlogAdmin(event)
  const postId = Number(getRouterParam(event, "id"))
  if (!Number.isSafeInteger(postId) || postId < 1) {
    throw createError({ statusCode: 400, message: "帖子参数无效" })
  }

  const post = await adminSql.setPostActive(postId, 1)
  if (!post) throw createError({ statusCode: 404, message: "帖子不存在" })
  return { ok: true }
})
