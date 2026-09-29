import { assertMethod, proxyRequest } from "h3";

const target = "https://www.eng-link-ai.net/v1/images/generations";
// const apiKey = "sk-UBwoQKzcgLixeCbt3um1C9KfEKaNV9IBNYTWy9WiObP9i33S";
const apiKey = "sk-9fnQWSRt0OpXVqMSj2Uaqx0zB9ltoyrX1AT6LhWYjZEmT9ep";

export default defineEventHandler((event) => {
  assertMethod(event, "POST");

  return proxyRequest(event, target, {
    headers: { authorization: `Bearer ${apiKey}` },
  });
});
