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