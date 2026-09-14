import fs from "node:fs";
import path from "node:path";
import { createError, getRouterParam, sendStream, setHeader } from "h3";
import { getBlogImageDirectory } from "../../utils/blogImages";

const contentTypes = {
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
};

export default defineEventHandler((event) => {
    const name = path.basename(getRouterParam(event, "name") || "");

    const imageDirectory = getBlogImageDirectory();

    const filePath = path.join(imageDirectory, name);

    if (!fs.existsSync(filePath)) {
        throw createError({ statusCode: 404, message: "图片不存在" });
    }

    const contentType = contentTypes[path.extname(name).toLowerCase()];
    if (!contentType) {
        throw createError({ statusCode: 415, message: "不支持的图片格式" });
    }

    setHeader(event, "content-type", contentType);
    setHeader(event, "cache-control", "public, max-age=31536000, immutable");
    return sendStream(event, fs.createReadStream(filePath));
});
