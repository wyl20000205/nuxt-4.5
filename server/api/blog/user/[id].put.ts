import { createError, getRouterParam } from "h3"
import { adminSql } from "../../../utils/admin/sql"
import { requireBlogAdmin } from "../../../utils/blogSession"

export default defineEventHandler(async (event) => {
  await requireBlogAdmin(event)
  const userId = Number(getRouterParam(event, "id"))
  if (!Number.isSafeInteger(userId) || userId < 2) {
    throw createError({ statusCode: 400, message: "用户参数无效" })
  }

  const user = await adminSql.setUserActive(userId, 1)
  if (!user) throw createError({ statusCode: 404, message: "用户不存在" })
  return { ok: true }
})
