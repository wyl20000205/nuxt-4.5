import { getRequestURL, getRouterParam, proxyRequest } from "h3";

export default defineEventHandler((event) => {
  const path = getRouterParam(event, "path")?.replace(/^\/+/, "") ?? "";
  const search = getRequestURL(event).search;
  console.log(path);
  

  return proxyRequest(event, `http://127.0.0.1:4000/v1/${path}${search}`);
});
