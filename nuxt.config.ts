// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    
  },
  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "nuxt-echarts",
    "@nuxtjs/tailwindcss",
  ],
  vite: {
    // Vue macro virtual files have no absolute path. Vite 8's OXC otherwise
    // resolves the root tsconfig references from app/ and looks for app/.nuxt.
    oxc: { tsconfig: false } as any,
  },
  app: {
  
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
});
