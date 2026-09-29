import { indexSql } from "../../utils/index/sql"
import { getBlogUser } from "../../utils/blogSession"
import { setHeader } from "h3"

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "private, no-store")
  const viewer = await getBlogUser(event)
  const rows = await indexSql.findMany(viewer?.id ?? null)

  return {
    posts: rows.map((post) => {
      const imgList = Array.isArray(post.images)
        ? post.images.filter((image): image is string => typeof image === "string")
        : []

      return {
        id: post.id,
        uuid: post.uuid,
        username: post.username,
        user_id: post.userId,
        text: post.text || "",
        img_list: imgList,
        time: post.createdAt.getTime(),
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        liked: post.liked,
      }
    }),
  }
})
