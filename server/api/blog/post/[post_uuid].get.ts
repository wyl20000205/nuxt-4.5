import { createError, getQuery, getRouterParam } from "h3";
import { getBlogUser } from "../../../utils/blogSession";
import { indexSql } from "../../../utils/index/sql";

export default defineEventHandler(async (event) => {
  const usernameValue = getQuery(event).username;
  const username = typeof usernameValue === "string" ? usernameValue : "";
  const uuid =
    getRouterParam(event, "post_uuid") || getRouterParam(event, "id") || "";
  if (!username || !uuid || username.length > 32) {
    throw createError({ statusCode: 404, message: "帖子不存在" });
  }

  const viewer = await getBlogUser(event);
  const post = await indexSql.findByPermalink(username, uuid, viewer?.id ?? null);
  if (!post) throw createError({ statusCode: 404, message: "帖子不存在" });
  const comments = await indexSql.findComments(post.id);

  return {
    post: {
      id: post.id,
      uuid: post.uuid,
      username: post.username,
      user_id: post.userId,
      text: post.text || "",
      img_list: Array.isArray(post.images)
        ? post.images.filter((image): image is string => typeof image === "string")
        : [],
      time: post.createdAt.getTime(),
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      liked: post.liked,
    },
    comments: comments.map((comment) => ({
      ...comment,
      time: comment.createdAt.getTime(),
      createdAt: undefined,
    })),
  };
});
