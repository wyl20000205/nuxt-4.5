import { defineNuxtConfig } from "nuxt/config";

export const database = {
  url: "postgresql://root:Mm123456789%40@8.219.63.91:5432/blog",
};

export default defineNuxtConfig({
  compatibilityDate: "2030-01-01",
  devtools: { enabled: true },
  runtimeConfig: {
    database,
  },
  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/image",
    "@vite-pwa/nuxt",
    "@nuxtjs/tailwindcss",
  ],
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      id: "/",
      name: "华落博客-门户首页",
      short_name: "华落博客",
      lang: "zh-CN",
      start_url: "/",
      scope: "/",
      display: "standalone",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  },
  image: {
    domains: ["i.ibb.co", "q1.qlogo.cn"],
    weserv: {
      baseURL: "/",
    },
  },
  vite: {
    oxc: { tsconfig: false } as any,
  },
});
