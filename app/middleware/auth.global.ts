import { useUserStore } from "~/stores/user";

const USER_TOKEN_STORAGE_KEY = "token_user";

export default defineNuxtRouteMiddleware(async (to) => {
  const isUserRoute = to.path === "/user" || to.path.startsWith("/user/");
  if (!isUserRoute) return;

  const userStore = useUserStore();
  const tokenCookie = useCookie<string | null>(USER_TOKEN_STORAGE_KEY, {
    maxAge: 3600,
    path: "/",
    sameSite: "strict",
    secure: import.meta.env.PROD,
  });
  let token = tokenCookie.value || userStore.token_user;

  if (!token && import.meta.client) {
    const storedToken = localStorage.getItem(USER_TOKEN_STORAGE_KEY);
    if (storedToken) {
      token = storedToken;
      tokenCookie.value = storedToken;
    }
  }

  if (!token) {
    userStore.token_user = "";
    return navigateTo("/login");
  }

  userStore.token_user = token;
  try {
    const { code } = await $fetch<{ code: number }>(
      "/api/auth/verify",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (code === 200) {
      if (import.meta.client) {
        localStorage.setItem(USER_TOKEN_STORAGE_KEY, token);
      }
      return;
    }
  } catch (error) {
    const statusCode =
      (error as { statusCode?: number }).statusCode ??
      (error as { response?: { status?: number } }).response?.status;

    if (statusCode !== 401) {
      console.error("登录状态校验失败", error);
      return abortNavigation(
        createError({
          statusCode: 503,
          message: "登录状态校验暂时不可用",
        }),
      );
    }
  }

  tokenCookie.value = null;
  if (import.meta.client) {
    localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
  }
  userStore.token_user = "";
  return navigateTo("/login");
});
