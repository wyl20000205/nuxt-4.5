import { db } from "../db";
import { random5 } from "../tool";

export interface PostRow {
  id: number;
  userId: number;
  text: string | null;
  images: unknown;
  createdAt: Date;
  likeCount: number;
  liked: boolean;
  uuid: string;
  username: string;
  commentCount: number;
}

export interface CommentRow {
  id: string;
  parentId: string | null;
  text: string;
  createdAt: Date;
  username: string;
}

export const indexSql = {
  async register(password: string) {
    const client = await db().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(1847263106)");
      const {
        rows: [state],
      } = await client.query<{
        duplicate: boolean;
        frequent: boolean | null;
      }>(
        `SELECT EXISTS (SELECT 1 FROM t_user WHERE password = $1) AS duplicate,
                 (SELECT MAX(time) FROM t_user)
                   > now() - interval '30 seconds' AS frequent`,
        [password],
      );
      if (state?.duplicate || state?.frequent) {
        await client.query("COMMIT");
        return state?.duplicate ? "duplicate" : "frequent";
      }
      let username = random5();
      while (
        (await client.query("SELECT 1 FROM t_user WHERE username = $1", [username]))
          .rowCount
      ) {
        username = random5();
      }
      const result = await client.query<{
        id: number;
        password: string;
        username: string;
      }>(
        `INSERT INTO t_user (password, username)
         VALUES ($1, $2)
         ON CONFLICT (password) DO NOTHING
         RETURNING id, password, username`,
        [password, username],
      );
      await client.query("COMMIT");
      return result.rows[0] ?? "duplicate";
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // 查询全部文章，固定按最新文章排序。
  async findMany(viewerId: number | null) {
    const result = await db().query<PostRow>(
      `
      SELECT p.id,
             p.user_id AS "userId",
             p.text,
             p.img AS images,
             p.time AS "createdAt",
             p.uuid,
             u.username,
             (SELECT COUNT(*)::int
              FROM t_comment c
              WHERE c.post_id = p.id AND c.active = 1) AS "commentCount",
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
    `,
      [viewerId],
    );

    return result.rows;
  },

  async findByPermalink(
    username: string,
    uuid: string,
    viewerId: number | null,
  ) {
    const result = await db().query<PostRow>(
      `SELECT p.id,
              p.user_id AS "userId",
              p.text,
              p.img AS images,
              p.time AS "createdAt",
              p.uuid,
              u.username,
              (SELECT COUNT(*)::int
               FROM t_comment c
               WHERE c.post_id = p.id AND c.active = 1) AS "commentCount",
              (SELECT COUNT(*)::int
               FROM t_post_like l
               JOIN t_user liker ON liker.id = l.user_id AND liker.active = 1
               WHERE l.post_id = p.id) AS "likeCount",
              EXISTS (SELECT 1 FROM t_post_like l
                      WHERE l.post_id = p.id AND l.user_id = $3) AS liked
       FROM t_post p
       JOIN t_user u ON u.id = p.user_id AND u.active = 1
       WHERE u.username = $1 AND p.uuid = $2 AND p.active = 1
       LIMIT 1`,
      [username, uuid, viewerId],
    );
    return result.rows[0] ?? null;
  },

  async findComments(postId: number) {
    const result = await db().query<CommentRow>(
      `SELECT c.id::text AS id,
              c.parent_id::text AS "parentId",
              c.text,
              c.time AS "createdAt",
              u.username
       FROM t_comment c
       JOIN t_user u ON u.id = c.user_id AND u.active = 1
       WHERE c.post_id = $1 AND c.active = 1
       ORDER BY c.time ASC`,
      [postId],
    );
    return result.rows;
  },

  async createComment(data: {
    postId: number;
    userId: number;
    parentId: string | null;
    text: string;
  }) {
    const result = await db().query<CommentRow>(
      `WITH inserted AS (
         INSERT INTO t_comment (post_id, user_id, parent_id, text)
         SELECT p.id, $2, $3::bigint, $4
         FROM t_post p
         WHERE p.id = $1 AND p.active = 1
           AND ($3::bigint IS NULL OR EXISTS (
             SELECT 1 FROM t_comment parent
             WHERE parent.id = $3::bigint
               AND parent.post_id = p.id
               AND parent.active = 1
           ))
         RETURNING id, parent_id, text, time, user_id
       )
       SELECT i.id::text AS id,
              i.parent_id::text AS "parentId",
              i.text,
              i.time AS "createdAt",
              u.username
       FROM inserted i
       JOIN t_user u ON u.id = i.user_id`,
      [data.postId, data.userId, data.parentId, data.text],
    );
    return result.rows[0] ?? null;
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
      );
    } else {
      await db().query(
        `DELETE FROM t_post_like l
         USING t_post p, t_user author
         WHERE l.post_id = p.id AND p.user_id = author.id
           AND p.id = $1 AND l.user_id = $2
           AND p.active = 1 AND author.active = 1`,
        [postId, userId],
      );
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
    );
    return result.rows[0] ?? null;
  },
};
