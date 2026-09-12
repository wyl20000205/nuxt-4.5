export default defineNuxtConfig({
  compatibilityDate: "2030-01-01",
  devtools: { enabled: true },
  runtimeConfig: {},
  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "nuxt-echarts",
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
  ],
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
