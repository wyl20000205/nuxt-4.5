import { proxyRequest } from "h3";

export default defineEventHandler((event) =>
  proxyRequest(
    event,
    "https://www.eng-link-ai.com/api/user/login?turnstile=",
    {
      cookieDomainRewrite: "",
      cookiePathRewrite: "/",
    },
  ),
);
