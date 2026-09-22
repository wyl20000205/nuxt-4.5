import { useIndexStore } from "~/stores/index";

type Session = {
  userId: number;
  role: "admin" | "user";
};

export default defineNuxtRouteMiddleware(async (to) => {
  const indexStore = useIndexStore();
  try {
    const session = await useRequestFetch()<Session>("/api/blog/session");
    indexStore.setSession(session.userId);

    if (to.path.startsWith("/admin") && session.userId !== 1) {
      return navigateTo("/user");
    }
    if (to.path.startsWith("/user") && session.userId === 1) {
      return navigateTo("/admin");
    }
  } catch {
    indexStore.setSession(null);
    return navigateTo("/");
  }
});
