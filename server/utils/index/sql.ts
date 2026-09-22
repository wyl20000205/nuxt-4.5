import { db } from "../db"

export interface PostRow {
  id: number
  userId: number
  text: string | null
  images: unknown
  createdAt: Date
  likeCount: number
  liked: boolean
}

export const indexSql = {
  async register(password: string) {
    const client = await db().connect()
    try {
      await client.query("BEGIN")
      await client.query("SELECT pg_advisory_xact_lock(1847263106)")
      const { rows: [state] } = await client.query<{
        duplicate: boolean
        frequent: boolean | null
      }>(`SELECT EXISTS (SELECT 1 FROM t_user WHERE password = $1) AS duplicate,
                 (SELECT MAX(time) FROM t_user)
                   > now() - interval '30 seconds' AS frequent`, [password])
      if (state?.duplicate || state?.frequent) {
        await client.query("COMMIT")
        return state?.duplicate ? "duplicate" : "frequent"
      }
      const result = await client.query<{ id: number; password: string }>(
        `INSERT INTO t_user (password)
         VALUES ($1)
         ON CONFLICT (password) DO NOTHING
         RETURNING id, password`,
        [password],
      )
      await client.query("COMMIT")
      return result.rows[0] ?? "duplicate"
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  },

  // 查询全部文章，固定按最新文章排序。
  async findMany(viewerId: number | null) {
    const result = await db().query<PostRow>(`
      SELECT p.id,
             p.user_id AS "userId",
             p.text,
             p.img AS images,
             p.time AS "createdAt",
             (SELECT COUNT(*)::int
              FROM t_post_like l
              JOIN t_user liker ON liker.id = l.user_id AND liker.active = 1
              WHERE l.post_id = p.id) AS "likeCount",
             EXISTS (SELECT 1 FROM t_post_like l
                     WHERE l.post_id = p.id AND l.user_id = $1) AS liked
      FROM t_post p
      JOIN t_user u ON u.id = p.user_id AND u.active = 1
      WHERE p.active = 1
      ORDER BY p.id DESC
    `, [viewerId])

    return result.rows
  },

  async setLike(postId: number, userId: number, liked: boolean) {
    if (liked) {
      await db().query(
        `INSERT INTO t_post_like (post_id, user_id)
         SELECT p.id, $2 FROM t_post p
         JOIN t_user author ON author.id = p.user_id AND author.active = 1
         WHERE p.id = $1 AND p.active = 1
         ON CONFLICT (post_id, user_id) DO NOTHING`,
        [postId, userId],
      )
    } else {
      await db().query(
        `DELETE FROM t_post_like l
         USING t_post p, t_user author
         WHERE l.post_id = p.id AND p.user_id = author.id
           AND p.id = $1 AND l.user_id = $2
           AND p.active = 1 AND author.active = 1`,
        [postId, userId],
      )
    }

    const result = await db().query<{ likeCount: number; liked: boolean }>(
      `SELECT (SELECT COUNT(*)::int FROM t_post_like l
               JOIN t_user liker ON liker.id = l.user_id AND liker.active = 1
               WHERE l.post_id = p.id) AS "likeCount",
              EXISTS (SELECT 1 FROM t_post_like l
                      WHERE l.post_id = p.id AND l.user_id = $2) AS liked
       FROM t_post p
       JOIN t_user author ON author.id = p.user_id AND author.active = 1
       WHERE p.id = $1 AND p.active = 1`,
      [postId, userId],
    )
    return result.rows[0] ?? null
  },
}
