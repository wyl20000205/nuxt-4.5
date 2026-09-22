import { defineStore } from "pinia";

type AnyFunction = (this: any, ...args: any[]) => unknown;

export function debounce<T extends AnyFunction>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function throttle<T extends AnyFunction>(fn: T, delay: number) {
  let lastTime = 0;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

export const useIndexStore = defineStore("storeIndex", {
  state() {
    return {
      token_index: "",
      sessionUserId: null as number | null,
      sessionRevision: 0,
      search_show: 0,
      customize_show: 0,
      show_section: 0,
      init_data: {
        swiper: [] as any[],
        news: [] as any[],
        food: [] as any[],
        detail: [] as any[],
        user_notice: { content: "" },
        business_notice: { content: "" },
      },
    };
  },
  getters: {
    item_nav: (state) => [
      { icon: "icon-a-042_fujin", text: "首页", display: 1 },
      { icon: "icon-a-042_faxian", text: "发帖", display: 1 },
      { icon: "icon-a-042_wode-09", text: state.sessionUserId ? "后台" : "登录", display: 1 },
      { icon: "icon-a-042_biaoqing", text: "注册", display: 1 },
      { icon: "icon-a-042_sousuo", text: "搜索", display: 0 },
      { icon: "icon-a-042_tianjia", text: "笔记", display: 1 },
    ],
  },
  actions: {
    formatPostTime(value: number) {
      const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;
      const date = new Date(timestamp);
      const now = new Date();

      if (Number.isNaN(date.getTime())) return "";

      const elapsed = now.getTime() - timestamp;
      if (elapsed >= 0 && elapsed < 60_000) return "刚刚";
      if (elapsed >= 0 && elapsed < 3_600_000)
        return `${Math.floor(elapsed / 60_000)}分钟前`;
      if (elapsed >= 0 && elapsed < 86_400_000)
        return `${Math.floor(elapsed / 3_600_000)}小时前`;

      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      const postStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).getTime();
      const dayDistance = Math.round((todayStart - postStart) / 86_400_000);
      if (dayDistance === 1) return "昨天";
      if (dayDistance > 1 && dayDistance < 7) return `${dayDistance}天前`;
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    setSession(userId: number | null) {
      this.sessionUserId = userId;
      this.sessionRevision++;
    },
    async refreshSession() {
      const revision = this.sessionRevision;
      try {
        const { userId } = await $fetch<{ userId: number }>("/api/blog/session");
        if (this.sessionRevision === revision) this.setSession(userId);
      } catch {
        if (this.sessionRevision === revision) this.setSession(null);
      }
      return this.sessionUserId;
    },
    handle_inp(event: Event): string {
      const input = event.target as HTMLInputElement | null;
      if (!input) return "";
      const value = input.value.replace(/[^\x21-\x7E]/g, "");
      input.value = value;
      return value;
    },
    createRipple(event: MouseEvent): void {
      if (typeof window === "undefined") return;

      const target = event.currentTarget as HTMLElement | null;
      if (!target) return;

      if (window.getComputedStyle(target).position === "static") {
        target.style.position = "relative";
      }
      target.style.overflow = "hidden";

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement("span");
      ripple.className = "btn_ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      target.querySelectorAll(".btn_ripple").forEach((node) => node.remove());
      target.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    },
  },
});
