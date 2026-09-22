import { adminSql } from "../../utils/admin/sql"
import { requireBlogUser } from "../../utils/blogSession"
import { userSql } from "../../utils/user/sql"

export default defineEventHandler(async (event) => {
  const user = await requireBlogUser(event)
  const isAdmin = user.id === 1
  const [posts, users] = await Promise.all([
    isAdmin ? adminSql.findPosts() : userSql.findPosts(user.id),
    isAdmin ? adminSql.findUsers() : Promise.resolve([]),
  ])

  return {
    userId: user.id,
    role: isAdmin ? "admin" : "user",
    posts: posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      text: post.text || "",
      images: Array.isArray(post.images)
        ? post.images.filter((image): image is string => typeof image === "string")
        : [],
      imageCount: Array.isArray(post.images) ? post.images.length : 0,
      time: post.createdAt.getTime(),
      active: "active" in post ? post.active : true,
      authorActive: "authorActive" in post ? post.authorActive : true,
    })),
    users: users.map((managedUser) => ({
      id: managedUser.id,
      postCount: managedUser.postCount,
      time: managedUser.createdAt.getTime(),
      active: managedUser.active,
    })),
  }
})
