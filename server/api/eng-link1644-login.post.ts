import { proxyRequest } from "h3";

export default defineEventHandler((event) =>
  proxyRequest(
    event,
    "https://eng-link-ai.com:1644/api/user/login?turnstile=",
    {
      cookieDomainRewrite: "",
      cookiePathRewrite: "/",
    },
  ),
);
