import { mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { hashBlogPassword } from "./blogAuth"

let database: DatabaseSync | undefined

export function getDatabase() {
  if (database) return database

  const filename = resolve(process.cwd(), "blog.sqlite")
  mkdirSync(dirname(filename), { recursive: true })

  database = new DatabaseSync(filename)
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS t_user (
      id INTEGER PRIMARY KEY,
      password TEXT NOT NULL,
      time DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS t_post (
      id INTEGER PRIMARY KEY,
      user_id INTEGER REFERENCES t_user(id),
      text TEXT,
      img TEXT,
      time DATE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const postColumns = database.prepare("PRAGMA table_info(t_post)").all() as {
    name: string
  }[]
  if (!postColumns.some(({ name }) => name === "user_id")) {
    database.exec(
      "ALTER TABLE t_post ADD COLUMN user_id INTEGER REFERENCES t_user(id)",
    )
  }

  const password = hashBlogPassword("Mm123456789@")
  database
    .prepare(`
      INSERT INTO t_user (password, time)
      SELECT ?, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM t_user)
    `)
    .run(password)

  return database
}
