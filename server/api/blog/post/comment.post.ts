import { createError, readBody } from "h3";
import { requireBlogUser } from "../../../utils/blogSession";
import { indexSql } from "../../../utils/index/sql";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    postId?: unknown;
    text?: unknown;
    parentId?: unknown;
  }>(event);
  const postId =
    typeof body?.postId === "number" && Number.isSafeInteger(body.postId)
      ? body.postId
      : 0;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const parentId =
    typeof body?.parentId === "string" && /^\d+$/.test(body.parentId)
      ? body.parentId
      : null;

  if (postId < 1) {
    throw createError({ statusCode: 400, message: "文章 ID 无效" });
  }
  if (text.length < 1 || text.length > 1000) {
    throw createError({
      statusCode: 400,
      message: "评论长度应为 1 至 1000 个字符",
    });
  }

  const user = await requireBlogUser(event);
  const comment = await indexSql.createComment({
    postId,
    userId: user.id,
    parentId,
    text,
  });
  if (!comment) {
    throw createError({ statusCode: 404, message: "文章或回复目标不存在" });
  }

  return {
    comment: {
      ...comment,
      time: comment.createdAt.getTime(),
      createdAt: undefined,
    },
  };
});
