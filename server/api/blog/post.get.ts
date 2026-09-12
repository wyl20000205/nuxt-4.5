import { getDatabase } from "../../utils/db"

type PostRow = {
  id: number
  user_id: number
  text: string | null
  img: string | null
  time: number | string | null
}

export default defineEventHandler(() => {
  const rows = getDatabase()
    .prepare("SELECT id, user_id, text, img, time FROM t_post ORDER BY id DESC")
    .all() as PostRow[]

  return {
    posts: rows.map((post) => {
      let imgList: string[] = []
      try {
        const parsed = JSON.parse(post.img || "[]")
        if (Array.isArray(parsed)) {
          imgList = parsed.filter((image): image is string => typeof image === "string")
        }
      } catch {}

      const numericTime = Number(post.time)
      return {
        id: post.id,
        user_id: post.user_id,
        text: post.text || "",
        img_list: imgList,
        time: Number.isFinite(numericTime)
          ? numericTime
          : new Date(post.time || 0).getTime(),
      }
    }),
  }
})
