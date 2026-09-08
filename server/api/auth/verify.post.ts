import tool from "#server/backend/tool";

export default defineEventHandler((event) => {
  const token = getHeader(event, "authorization");
  const user = tool.check_token(token);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "TOKEN_INVALID",
    });
  }

  return {
    code: 200,
    msg: "TOKEN_VALID",
    data: { id: user.id, user: user.user },
  };
});
