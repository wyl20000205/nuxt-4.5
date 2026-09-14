import { getPrisma } from "../../utils/prisma"

export default defineEventHandler(async (event) => {
  const prisma = getPrisma(event)
  const rows = await prisma.post.findMany({ orderBy: { id: "desc" } })

  return {
    posts: rows.map((post) => {
      const imgList = Array.isArray(post.images)
        ? post.images.filter((image): image is string => typeof image === "string")
        : []

      return {
        id: post.id,
        user_id: post.userId,
        text: post.text || "",
        img_list: imgList,
        time: post.createdAt.getTime(),
      }
    }),
  }
})
