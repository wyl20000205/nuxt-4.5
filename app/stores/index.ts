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
  actions: {
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
