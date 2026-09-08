export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, "path") || "";
  const method = getMethod(event);
  const allowed =
    (method === "POST" && path === "images/generations") ||
    (method === "POST" && path === "contents/generations/tasks") ||
    (method === "GET" && /^contents\/generations\/tasks\/[^/]+$/.test(path));

  if (!allowed) throw createError({ statusCode: 404, statusMessage: "Unsupported ARK route" });

  const config = useRuntimeConfig(event);
  if (!config.arkApiKey) {
    throw createError({ statusCode: 500, statusMessage: "NUXT_ARK_API_KEY is missing" });
  }

  return $fetch(`${config.arkBaseUrl}/api/v3/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.arkApiKey}`,
    },
    body: method === "POST" ? await readBody(event) : undefined,
  });
});
