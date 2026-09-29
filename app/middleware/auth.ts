import { useIndexStore } from "~/stores/index";

type Session = {
  userId: number | null;
  role: "admin" | "user" | null;
};

export default defineNuxtRouteMiddleware(async (to) => {
  const indexStore = useIndexStore();
  try {
    const session = await useRequestFetch()<Session>("/api/blog/session");
    indexStore.setSession(session.userId);

    if (!session.userId) return navigateTo("/");

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
