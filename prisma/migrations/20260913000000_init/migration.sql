-- 创建博客用户表。
CREATE TABLE "t_user" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "time" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "t_user_pkey" PRIMARY KEY ("id")
);

-- img 使用 JSONB，直接保存图片地址数组。
CREATE TABLE "t_post" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "text" TEXT,
    "img" JSONB NOT NULL DEFAULT '[]',
    "time" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "t_post_pkey" PRIMARY KEY ("id")
);

-- 加速按用户和时间查询帖子。
CREATE INDEX "t_post_user_id_idx" ON "t_post"("user_id");
CREATE INDEX "t_post_time_idx" ON "t_post"("time");

-- 每篇帖子必须属于一个真实用户。
ALTER TABLE "t_post"
ADD CONSTRAINT "t_post_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "t_user"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
