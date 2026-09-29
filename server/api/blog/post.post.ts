import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createError, readMultipartFormData } from "h3";
import {
  getBlogImageDirectory,
  getBlogImageExtension,
} from "../../utils/blogImages";
import { requireBlogUser } from "../../utils/blogSession";
import { userSql } from "../../utils/user/sql";

export default defineEventHandler(async (event) => {
  const user = await requireBlogUser(event);

  const parts = (await readMultipartFormData(event)) || [];
  const textPart = parts.find(
    (part) => part.name === "text" && !part.filename,
  );
  const text = textPart ? textPart.data.toString("utf8").trim() : "";
  const images = parts.filter(
    (part) => part.name === "images" && Boolean(part.filename),
  );

  // --- 先做便宜的校验（数量/长度），再对图片内容做嗅探 ---
  if (!text && images.length === 0) {
    throw createError({ statusCode: 400, message: "帖子内容不能为空" });
  }
  if (text.length > 5000 || images.length > 9) {
    throw createError({ statusCode: 400, message: "文字或图片数量超出限制" });
  }

  // 数量已确认合法，这里才对每张图片做内容嗅探（magic bytes）
  const imageExtensions = images.map(({ data }) => getBlogImageExtension(data));

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
  const imageNames = imageExtensions.map(
    (extension, index) =>
      `${user.id}_${index}_${randomUUID().replaceAll("-", "")}${extension}`,
  );

  // 纯文字帖子不需要创建图片目录
  if (images.length > 0) {
    await mkdir(imageDirectory, { recursive: true });
  }

  // 精确记录“真正写成功”的文件名，避免 Promise.all 提前 reject
  // 导致清理时漏删后写完的孤儿文件
  const writtenNames: string[] = [];

  try {
    const writeResults = await Promise.allSettled(
      images.map(async ({ data }, index) => {
        const name = imageNames[index]!;
        await writeFile(join(imageDirectory, name), data);
        writtenNames.push(name);
      }),
    );

    const writeFailure = writeResults.find(
      (result): result is PromiseRejectedResult =>
        result.status === "rejected",
    );
    if (writeFailure) {
      throw writeFailure.reason;
    }

    const result = await userSql.create({
      userId: user.id,
      text,
      images: imageNames,
    });
    if (result === "frequent") {
      throw createError({ statusCode: 429, message: "发帖频繁，请 30 秒后重试" });
    }
    const time = result.createdAt.getTime();

    return {
      post: {
        id: result.id,
        uuid: result.uuid,
        username: user.username,
        user_id: user.id,
        text,
        img_list: imageNames,
        time,
        likeCount: 0,
        commentCount: 0,
        liked: false,
      },
    };
  } catch (error) {
    // 只清理确实写到磁盘上的文件
    await Promise.all(
      writtenNames.map((name) =>
        rm(join(imageDirectory, name), { force: true }),
      ),
    );
    throw error;
  }
});
