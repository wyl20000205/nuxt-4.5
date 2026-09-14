import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createError, readMultipartFormData } from "h3";
import {
  getBlogImageDirectory,
  getBlogImageExtension,
} from "../../utils/blogImages";
import { requireBlogUser } from "../../utils/blogSession";
import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const user = await requireBlogUser(event);
  const prisma = getPrisma(event);

  const parts = (await readMultipartFormData(event)) || [];
  const textPart = parts.find((part) => part.name === "text" && !part.filename);
  const text = textPart ? textPart.data.toString("utf8").trim() : "";
  const images = parts.filter(
    (part) => part.name === "images" && Boolean(part.filename),
  );
  const imageExtensions = images.map(({ data }) => getBlogImageExtension(data));

  if (!text && images.length === 0) {
    throw createError({ statusCode: 400, message: "帖子内容不能为空" });
  }
  if (text.length > 5000 || images.length > 9) {
    throw createError({ statusCode: 400, message: "文字或图片数量超出限制" });
  }
  if (
    images.some(
      ({ data }, index) =>
        !imageExtensions[index] || data.length > 10 * 1024 * 1024,
    )
  ) {
    throw createError({
      statusCode: 400,
      message: "仅支持 10MB 内的 JPG、PNG、WebP、GIF 图片",
    });
  }

  const imageDirectory = getBlogImageDirectory();
  await mkdir(imageDirectory, { recursive: true });
  const imageNames = imageExtensions.map(
    (extension, index) =>
      `${user.id}_${index}_${randomUUID().replaceAll("-", "")}${extension}`,
  );

  try {
    await Promise.all(
      images.map(({ data }, index) =>
        writeFile(join(imageDirectory, imageNames[index]!), data),
      ),
    );
    const result = await prisma.post.create({
      data: {
        userId: user.id,
        text,
        images: imageNames,
      },
      select: { id: true, createdAt: true },
    });
    const time = result.createdAt.getTime();

    return {
      post: {
        id: result.id,
        user_id: user.id,
        text,
        img_list: imageNames,
        time,
      },
    };
  } catch (error) {
    await Promise.all(
      imageNames.map((name) => rm(join(imageDirectory, name), { force: true })),
    );
    throw error;
  }
});
