import type { H3Event } from "h3"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client"

// 开发环境热更新会重复加载模块，把客户端放到 globalThis 可以复用连接池。
const globalPrisma = globalThis as typeof globalThis & {
  blogPrisma?: PrismaClient
}

export function getPrisma(event: H3Event) {
  if (!globalPrisma.blogPrisma) {
    const { database } = useRuntimeConfig(event)
    globalPrisma.blogPrisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: database.url }),
    })
  }

  return globalPrisma.blogPrisma
}
