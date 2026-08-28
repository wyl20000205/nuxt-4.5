//  server/routes/images/[name].js   http://localhost:3000/images/logo.png

// import fs from "fs";
// import path from 'path'
// export default defineEventHandler(async (event) => {
//     if (event.node.req.url == '/images/undefined') return event;
//     let dest = ''
//     if (process.env.NODE_ENV == 'production') dest = '/root/wyl/.output/public/';
//     let filePath = path.join(dest, event.context.params.name);
//     // return URL.createObjectURL(fs.createReadStream(filePath)) 
//     fs.existsSync(filePath) || (filePath = path.join(dest, 'default.png'));
//     return sendStream(event, fs.createReadStream(filePath));
// });



import fs from "node:fs";
import path from "node:path";
import { getRouterParam, sendStream, setHeader } from "h3";

export default defineEventHandler((event) => {
    const name = path.basename(getRouterParam(event, "name") || "");

    const imageDirectory =
        process.env.NODE_ENV === "production"
            ? "/root/wyl/.output/public/images"
            : path.resolve(process.cwd(), "public/images");

    let filePath = path.join(imageDirectory, name);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(imageDirectory, "default.png");
    }

    if (filePath.endsWith(".txt")) {
        setHeader(event, "content-type", "text/plain; charset=utf-8");
    }

    return sendStream(event, fs.createReadStream(filePath));
});