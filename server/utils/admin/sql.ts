import { db } from "../db"

type AdminPostRow = {
  id: number
  userId: number
  text: string | null
  images: unknown
  createdAt: Date
  active: boolean
  authorActive: boolean
}

type AdminUserRow = {
  id: number
  createdAt: Date
  postCount: number
  active: boolean
}

export const adminSql = {
  async findPosts() {
    const result = await db().query<AdminPostRow>(`
      SELECT p.id,
             p.user_id AS "userId",
             p.text,
             p.img AS images,
             p.time AS "createdAt",
             p.active = 1 AS active,
             u.active = 1 AS "authorActive"
      FROM t_post p
      JOIN t_user u ON u.id = p.user_id
      ORDER BY p.id DESC
    `)

    return result.rows
  },

  async findUsers() {
    const result = await db().query<AdminUserRow>(`
      SELECT u.id,
             u.time AS "createdAt",
             u.active = 1 AS active,
             COUNT(p.id)::int AS "postCount"
      FROM t_user u
      LEFT JOIN t_post p ON p.user_id = u.id
      GROUP BY u.id, u.time, u.active
      ORDER BY u.id
    `)

    return result.rows
  },

  async setPostActive(postId: number, active: 0 | 1) {
    const result = await db().query<{ id: number }>(
      `UPDATE t_post
       SET active = $2
       WHERE id = $1
       RETURNING id`,
      [postId, active],
    )

    return result.rows[0] ?? null
  },

  async setUserActive(userId: number, active: 0 | 1) {
    const result = await db().query<{ id: number }>(
      `UPDATE t_user
       SET active = $2
       WHERE id = $1 AND id <> 1
       RETURNING id`,
      [userId, active],
    )

    return result.rows[0] ?? null
  },
}
