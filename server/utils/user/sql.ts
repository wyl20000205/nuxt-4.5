import { db } from "../db";
import { random5 } from "../tool";

type UserRow = {
  id: number;
  password: string;
  username: string;
};

type CreatedPostRow = {
  id: number;
  uuid: string;
  createdAt: Date;
};  

export const userSql = {
  // 查询第一个匹配用户。$1 是参数占位符，可以避免 SQL 注入。
  async findFirst(where: { password: string }) {
    try {
      const result = await db().query<UserRow>(
        "SELECT id, password, username FROM t_user WHERE password = $1 AND active = 1 LIMIT 1",
        [where.password],
      );

      return result.rows[0] ?? null;
    } catch (error) {
      throw new Error("[PostgreSQL] 查询用户失败", { cause: error });
    }
  },

  // 根据唯一 id 查询用户。
  async findUnique(where: { id: number }) {
    const result = await db().query<UserRow>(
      "SELECT id, password, username FROM t_user WHERE id = $1 AND active = 1 LIMIT 1",
      [where.id],
    );

    return result.rows[0] ?? null;
  },

  async findPosts(userId: number) {
    const result = await db().query<{
      id: number;
      userId: number;
      text: string | null;
      images: unknown;
      createdAt: Date;
    }>(
      `SELECT id,
              user_id AS "userId",
              text,
              img AS images,
              time AS "createdAt"
       FROM t_post
       WHERE user_id = $1 AND active = 1
       ORDER BY id DESC`,
      [userId],
    );

    return result.rows;
  },

  async findEditablePost(userId: number, postId: number) {
    const result = await db().query<{ images: unknown }>(
      `SELECT img AS images FROM t_post
       WHERE id = $1 AND (user_id = $2 OR $2 = 1) AND active = 1`,
      [postId, userId],
    );
    return result.rows[0] ?? null;
  },

  async updatePost(userId: number, postId: number, text: string, expectedImages: string[], images: string[]) {
    const result = await db().query<{ id: number; text: string | null; images: unknown }>(
      `UPDATE t_post
       SET text = $3, img = $4::jsonb
       WHERE id = $1 AND (user_id = $2 OR $2 = 1) AND active = 1
         AND COALESCE(img, '[]'::jsonb) = $5::jsonb
       RETURNING id, text, img AS images`,
      [postId, userId, text, JSON.stringify(images), JSON.stringify(expectedImages)],
    );

    return result.rows[0] ?? null;
  },

  async updatePostImages(userId: number, postId: number, expectedImages: string[], images: string[]) {
    const result = await db().query<{ id: number; text: string | null }>(
      `UPDATE t_post
       SET img = $4::jsonb
       WHERE id = $1 AND (user_id = $2 OR $2 = 1) AND active = 1
         AND COALESCE(img, '[]'::jsonb) = $3::jsonb
       RETURNING id, text`,
      [postId, userId, JSON.stringify(expectedImages), JSON.stringify(images)],
    );

    return result.rows[0] ?? null;
  },

  async deactivatePost(userId: number, postId: number) {
    const result = await db().query<{ id: number }>(
      `UPDATE t_post
       SET active = 0
       WHERE id = $1 AND user_id = $2 AND active = 1
       RETURNING id`,
      [postId, userId],
    );

    return result.rows[0] ?? null;
  },

  // 创建文章，并返回接口当前需要的字段。
  async create(data: { userId: number; text: string; images: string[] }) {
    const client = await db().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(1847263107)");
      const { rows: [state] } = await client.query<{ frequent: boolean | null }>(
        `SELECT (SELECT MAX(time) FROM t_post)
                  > now() - interval '30 seconds' AS frequent`,
      );
      if (state?.frequent) {
        await client.query("COMMIT");
        return "frequent";
      }

      let uuid = random5();
      while (
        (await client.query("SELECT 1 FROM t_post WHERE uuid = $1", [uuid]))
          .rowCount
      ) {
        uuid = random5();
      }

      const result = await client.query<CreatedPostRow>(
        `INSERT INTO t_post (user_id, text, img, uuid)
         VALUES ($1, $2, $3::jsonb, $4)
         RETURNING id, uuid, time AS "createdAt"`,
        [data.userId, data.text, JSON.stringify(data.images), uuid],
      );
      await client.query("COMMIT");
      return result.rows[0]!;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
