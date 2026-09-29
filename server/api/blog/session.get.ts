import { getBlogUser } from "../../utils/blogSession";

export default defineEventHandler(async (event) => {
  const user = await getBlogUser(event);
  return {
    userId: user?.id ?? null,
    role: user ? (user.id === 1 ? "admin" : "user") : null,
  };
});
