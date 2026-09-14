# nuxt 4x 使用说明 node 24.18.0

npm create nuxt@latest <name> cd name npm run dev
npm i -g pnpm bun

环境： pnpm i less less-loader axios pinia-plugin-persistedstate cors express multer mysql2 nodemailer nuxt-swiper jsonwebtoken moment jquery write-excel-file read-excel-file qrcode alipay-sdk

npx nuxi@latest module add pinia

pinia-plugin-persistedstate/nuxt

nuxt 4.0 不同于 3 最大更新是：把结构放到/app中 public 、 server 、app(stores 在app内) 平级
~是 app目录
~~是根目录

nuxt 4.0 不同于 3 最大更新是 把结构放到/app中

组件echart 使用 官网推荐的就行，预留空间给出codex用就行，并再components/Chart/Bar.vue定义复制来着

官网的模板和在页面导入，然后使用codex插入就行

打包文件 上传慢的问题 先整体打包 上传到服务器 再解压

tar -czf eng-link-output.tar.gz .output
unzip .output.zip -d .output
ln -s /home/wyl/blog /root/wyl
改变端口 PORT=3002 pm2 start .output/server/index.mjs


server的 /api 和 /routes 技术能力相似 区别 api 是
server/routes 就是用于创建不带 /api 前缀的服务端路由。

## Nuxt 部署与图片踩坑

`NuxtImg` 默认通过 IPX 处理远程图片，服务端会先请求源站，再生成 `/_ipx/` 图片。源站响应慢或域名未加入 `image.domains` 时，页面可能长时间留白。项目将远程域名加入 `nuxt.config.ts`，远程帖子图片指定 `weserv` provider，本地图片继续交给 IPX；`loading="lazy"` 仅提供浏览器懒加载提示，文章列表还需配合 `IntersectionObserver` 和 `v-if`，才能避免视口外图片提前渲染。

## PostgreSQL

项目按照 Prisma 当前的 Nuxt 指南，使用 `@prisma/client`、`@prisma/adapter-pg` 和 `server/utils/prisma.ts`。`@prisma/nuxt` 已由官方标记为弃用，新项目无需安装。

数据库连接信息位于 `nuxt.config.ts` 的私有 `runtimeConfig.database` 中，Prisma CLI 和 Nuxt 服务端共同使用：

```ts
const database = {
  url: "postgresql://root:Mm123456789%40@8.219.63.91:5432/blog",
}
```

首次部署按顺序执行：

```sh
# 生成 Prisma Client，并在 PostgreSQL 创建 t_user、t_post。
bun run db:generate
bun run db:migrate
```
