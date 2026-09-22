import { createError, getRouterParam, readBody } from "h3"
import { requireBlogUser } from "../../../../utils/blogSession"
import { isValidPostImageUrlEdit } from "../../../../utils/postImageUrls"
import { userSql } from "../../../../utils/user/sql"

export default defineEventHandler(async (event) => {
  const user = await requireBlogUser(event)
  const postId = Number(getRouterParam(event, "id"))
  if (!Number.isSafeInteger(postId) || postId < 1) {
    throw createError({ statusCode: 400, message: "帖子参数无效" })
  }

  const input: unknown = await readBody(event)
  if (!isValidPostImageUrlEdit(input)) {
    throw createError({ statusCode: 400, message: "图片地址无效，最多 9 张，仅支持 http 或 https 外链" })
  }

  const post = await userSql.updatePostImages(user.id, postId, input.expectedImages, input.images)
  if (!post) throw createError({ statusCode: 409, message: "帖子已被修改，请刷新后重试" })
  return { post: { id: post.id, text: post.text || "", images: input.images } }
})
