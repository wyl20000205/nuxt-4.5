import { requireBlogUser } from "../../utils/blogSession";

export default defineEventHandler(async (event) => {
  const user = await requireBlogUser(event);
  return { userId: user.id, role: user.id === 1 ? "admin" : "user" };
});
