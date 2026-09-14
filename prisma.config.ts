import { defineConfig } from "prisma/config"
import { database } from "./nuxt.config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: database.url,
  },
})
