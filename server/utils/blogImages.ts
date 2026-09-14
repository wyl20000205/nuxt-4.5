import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const getBlogImageDirectory = () =>
  import.meta.dev
    ? resolve(process.cwd(), "public/images")
    : fileURLToPath(new URL("../public/images", import.meta.url))

export function getBlogImageExtension(data: Buffer) {
  const signature = data.toString("hex", 0, 12)

  if (signature.startsWith("89504e470d0a1a0a")) return ".png"
  if (signature.startsWith("474946383761") || signature.startsWith("474946383961")) return ".gif"
  if (signature.startsWith("ffd8ff")) return ".jpg"
  if (signature.startsWith("52494646") && signature.slice(16, 24) === "57454250") return ".webp"
}
