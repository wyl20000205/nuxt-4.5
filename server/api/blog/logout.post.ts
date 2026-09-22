import { deleteCookie } from "h3"

export default defineEventHandler((event) => {
  deleteCookie(event, "blog_session", { path: "/" })
  return { ok: true }
})
