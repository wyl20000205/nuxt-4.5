import { createError, getCookie, type H3Event } from "h3";
import { verifyBlogSession } from "./blogAuth";
import { userSql } from "./user/sql";

export async function getBlogUser(event: H3Event) {
  const token = getCookie(event, "blog_session") || "";
  const userId = Number(token.split(".")[0]);
  const user =
    Number.isSafeInteger(userId) && userId > 0
      ? await userSql.findUnique({ id: userId })
      : undefined;

  if (!user || verifyBlogSession(token, user.password) !== user.id) {
    return null;
  }

  return { id: user.id };
}

export async function requireBlogUser(event: H3Event) {
  const user = await getBlogUser(event);
  if (!user) throw createError({ statusCode: 401, message: "请先登录" });
  return user;
}

export async function requireBlogAdmin(event: H3Event) {
  const user = await requireBlogUser(event);
  if (user.id !== 1) {
    throw createError({ statusCode: 403, message: "需要管理员权限" });
  }

  return user;
}
