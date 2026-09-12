import { resolve } from "node:path"

export const getBlogImageDirectory = () =>
  resolve(process.cwd(), "public/images")
