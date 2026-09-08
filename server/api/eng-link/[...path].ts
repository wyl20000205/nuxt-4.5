import {
  createError,
  getMethod,
  getQuery,
  getRouterParam,
  proxyRequest,
} from "h3";

const routes = new Map([
  [
    "GET user/self/groups",
    "https://www.eng-link-ai.com/api/user/self/groups",
  ],
  ["GET user/self", "https://www.eng-link-ai.com/api/user/self"],
  [
    "GET models/hot",
    "https://www.eng-link-ai.com/api/models/hot?top=10&group=default",
  ],
  [
    "GET user/models",
    "https://www.eng-link-ai.com/api/user/models?group=default",
  ],
  [
    "POST user/alipay/amount",
    "https://www.eng-link-ai.com/api/user/alipay/amount",
  ],
  [
    "GET subscription/plans",
    "https://www.eng-link-ai.com/api/subscription/plans",
  ],
  ["GET pricing", "https://www.eng-link-ai.com/api/pricing"],
  [
    "GET user/topup/info",
    "https://www.eng-link-ai.com/api/user/topup/info",
  ],
  [
    "POST user/wechat/pay",
    "https://www.eng-link-ai.com/api/user/wechat/pay",
  ],
  ["GET user/aff", "https://www.eng-link-ai.com/api/user/aff"],
  ["GET token", "https://www.eng-link-ai.com/api/token/?p=1&size=10"],
  ["POST token", "https://www.eng-link-ai.com/api/token/"],
  [
    "POST v1/chat/completions",
    "https://www.eng-link-ai.com/v1/chat/completions",
  ],
  [
    "POST v1/images/generations",
    "https://www.eng-link-ai.com/v1/images/generations",
  ],
  [
    "POST v1/images/edits",
    "https://www.eng-link-ai.com/v1/images/edits",
  ],
  [
    "POST v1/videos/generations",
    "https://www.eng-link-ai.com/v1/videos/generations",
  ],
]);

export default defineEventHandler((event) => {
  const path = getRouterParam(event, "path")?.replace(/^\/+|\/+$/g, "");
  const method = getMethod(event);
  const tokenKeyPath = path?.match(/^token\/(\d+)\/key$/);
  const tokenDeletePath = path?.match(/^token\/(\d+)$/);
  const videoTaskPath = path?.match(
    /^v1\/videos\/generations\/task\/([A-Za-z0-9_-]+)$/,
  );
  let target =
    videoTaskPath && method === "GET"
      ? `https://www.eng-link-ai.com/v1/videos/generations/task/${videoTaskPath[1]}`
      : tokenKeyPath && method === "POST"
        ? `https://www.eng-link-ai.com/api/token/${tokenKeyPath[1]}/key`
        : tokenDeletePath && method === "DELETE"
          ? `https://www.eng-link-ai.com/api/token/${tokenDeletePath[1]}`
          : routes.get(`${method} ${path}`);

  if ((path === "user" || path === "admin/org") && method === "GET") {
    const { p = "0", page_size = "10" } = getQuery(event);
    const query = new URLSearchParams({
      p: String(p),
      page_size: String(page_size),
    });
    const remotePath = path === "user" ? "user/" : "admin/org";
    target = `https://www.eng-link-ai.com/api/${remotePath}?${query}`;
  }

  if (path === "channel" && method === "GET") {
    const {
      p = "1",
      page_size = "10",
      id_sort = "false",
      tag_mode = "false",
    } = getQuery(event);
    const query = new URLSearchParams({
      p: String(p),
      page_size: String(page_size),
      id_sort: String(id_sort),
      tag_mode: String(tag_mode),
    });
    target = `https://www.eng-link-ai.com/api/channel/?${query}`;
  }

  if (path === "log" && method === "GET") {
    const {
      p = "1",
      page_size = "10",
      type = "0",
      username = "",
      token_name = "",
      model_name = "",
      start_timestamp = "1788364800",
      end_timestamp = "1788417294",
      channel = "",
      group = "",
      request_id = "",
    } = getQuery(event);
    const query = new URLSearchParams({
      p: String(p),
      page_size: String(page_size),
      type: String(type),
      username: String(username),
      token_name: String(token_name),
      model_name: String(model_name),
      start_timestamp: String(start_timestamp),
      end_timestamp: String(end_timestamp),
      channel: String(channel),
      group: String(group),
      request_id: String(request_id),
    });
    target = `https://www.eng-link-ai.com/api/log/?${query}`;
  }

  if (path === "verification" && method === "GET") {
    const { email = "", turnstile = "" } = getQuery(event);
    const query = new URLSearchParams({
      email: String(email),
      turnstile: String(turnstile),
    });
    target = `https://www.eng-link-ai.com/api/verification?${query}`;
  }

  if (path === "user/topup/self" && method === "GET") {
    const { keyword = "", p = "1", page_size = "5" } = getQuery(event);
    const query = new URLSearchParams({
      keyword: String(keyword),
      p: String(p),
      page_size: String(page_size),
    });
    target = `https://www.eng-link-ai.com/api/user/topup/self?${query}`;
  }

  if (!target) {
    throw createError({ statusCode: 404, statusMessage: "API_NOT_ALLOWED" });
  }

  return proxyRequest(event, target, {
    cookieDomainRewrite: "",
    cookiePathRewrite: "/",
  });
});
