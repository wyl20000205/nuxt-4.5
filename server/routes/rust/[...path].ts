import { getRequestURL, getRouterParam, proxyRequest } from "h3";

export default defineEventHandler((event) => {
  const path = getRouterParam(event, "path")?.replace(/^\/+/, "") ?? "";
  return proxyRequest(
    event,
    `http://8.219.63.91:4005/${path}${getRequestURL(event).search}`,
  );
});
