import { createError, getRouterParam } from "h3"
import { adminSql } from "../../../utils/admin/sql"
import { requireBlogUser } from "../../../utils/blogSession"
import { userSql } from "../../../utils/user/sql"

export default defineEventHandler(async (event) => {
  const user = await requireBlogUser(event)
  const postId = Number(getRouterParam(event, "id"))
  if (!Number.isSafeInteger(postId) || postId < 1) {
    throw createError({ statusCode: 400, message: "帖子参数无效" })
  }

  const post = user.id === 1
    ? await adminSql.setPostActive(postId, 0)
    : await userSql.deactivatePost(user.id, postId)
  if (!post) {
    throw createError({ statusCode: 404, message: "帖子不存在" })
  }

  return { ok: true }
})
