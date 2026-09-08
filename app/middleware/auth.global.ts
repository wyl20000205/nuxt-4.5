const ENGLINK_USER_ID_COOKIE = "eng_link_user_id";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/morse") return navigateTo("/morse/login");
  if (to.path === "/morse1644") return navigateTo("/morse1644/login");

  const routeRoot = to.path.startsWith("/morse1644")
    ? "/morse1644"
    : "/morse";
  const isMorseUserRoute =
    to.path === `${routeRoot}/user` ||
    to.path.startsWith(`${routeRoot}/user/`);
  const isMorseAdminRoute =
    to.path === `${routeRoot}/admin` ||
    to.path.startsWith(`${routeRoot}/admin/`);
  if (!isMorseUserRoute && !isMorseAdminRoute) return;

  const userIdCookie = useCookie<string | null>(ENGLINK_USER_ID_COOKIE, {
    path: "/",
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
  const userId = userIdCookie.value;

  if (userId) {
    try {
      const result = await useRequestFetch()<{
        success: boolean;
        data?: { id?: number; username?: string };
      }>(
        routeRoot === "/morse1644"
          ? "/api/eng-link1644/user/self"
          : "/api/eng-link/user/self",
        {
        credentials: "include",
        headers: { "New-Api-User": userId },
        },
      );

      if (result.success && String(result.data?.id) === userId) {
        if (!isMorseAdminRoute || result.data?.username === "admin") return;
        return navigateTo(`${routeRoot}/user/`);
      }
    } catch {
      // 无有效上游会话时统一返回登录页。
    }
  }

  userIdCookie.value = null;
  return navigateTo(`${routeRoot}/login`);
});
