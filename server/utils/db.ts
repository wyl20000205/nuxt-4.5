import { Pool } from "pg";

const globalDatabase = globalThis as typeof globalThis & {
  blogDatabase?: Pool;
};

// 开发环境热更新会重复加载模块，全局保存连接池可以避免重复连接数据库。
export function db(): Pool {
  if (globalDatabase.blogDatabase) {
    return globalDatabase.blogDatabase;
  }

  const { database } = useRuntimeConfig();

  if (!database.url) {
    throw new Error("[PostgreSQL] 数据库连接地址未配置");
  }

  const pool = new Pool({
    connectionString: database.url,
    connectionTimeoutMillis: 10000,
    options: "-c timezone=Asia/Shanghai",
  });

  pool.on("error", (error) => {
    console.error("[PostgreSQL] 连接池异常:", error);
  });

  globalDatabase.blogDatabase = pool;

  return pool;
}
