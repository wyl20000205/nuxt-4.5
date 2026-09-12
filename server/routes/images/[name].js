import fs from "node:fs";
import path from "node:path";
import { getRouterParam, sendStream, setHeader } from "h3";
import { getBlogImageDirectory } from "../../utils/blogImages";

export default defineEventHandler((event) => {
    const name = path.basename(getRouterParam(event, "name") || "");

    const imageDirectory = getBlogImageDirectory();

    let filePath = path.join(imageDirectory, name);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(imageDirectory, "default.png");
    }

    if (filePath.endsWith(".txt")) {
        setHeader(event, "content-type", "text/plain; charset=utf-8");
    }

    return sendStream(event, fs.createReadStream(filePath));
});
