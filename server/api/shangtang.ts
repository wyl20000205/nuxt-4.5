import { assertMethod, createError, getQuery, proxyRequest } from "h3";

const apiKey = "sk-0woQdsmDIKAnZFcMd0dB2vByiUL5ijac8c362961911e4b24A1B7D99671A27755";
const targets = {
  text: "https://api.senseaudio.cn/v1/chat/completions",
  image: "https://api.senseaudio.cn/v1/image/sync",
  video: "https://api.senseaudio.cn/v1/video/create",
} as const;

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const type = String(query.type || "");

  if (type === "video-status") {
    assertMethod(event, "GET");
    const id = String(query.id || "");
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(id)) {
      throw createError({ statusCode: 400, statusMessage: "INVALID_TASK_ID" });
    }
    return proxyRequest(event, `https://api.senseaudio.cn/v1/video/status?id=${encodeURIComponent(id)}`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
  }

  assertMethod(event, "POST");
  const target = targets[type as keyof typeof targets];
  if (!target) throw createError({ statusCode: 400, statusMessage: "INVALID_API_TYPE" });
  return proxyRequest(event, target, { headers: { authorization: `Bearer ${apiKey}` } });
});
