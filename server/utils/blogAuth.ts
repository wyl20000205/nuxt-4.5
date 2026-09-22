import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

const SESSION_AGE = 60 * 60 * 24 * 7;

export const hashBlogPassword = (password: string) =>
  scryptSync(password, "hualuo", 64).toString("hex");

export function verifyBlogPasswordHash(
  passwordHash: string,
  expectedHash: string,
) {
  const actual = Buffer.from(passwordHash, "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const verifyBlogPassword = (password: string, expectedHash: string) =>
  verifyBlogPasswordHash(hashBlogPassword(password), expectedHash);

const sign = (value: string, passwordHash: string) =>
  createHmac("sha256", passwordHash).update(value).digest("base64url");

export function createBlogSession(
  userId: number,
  passwordHash: string,
  now = Date.now(),
) {
  const value = `${userId}.${Math.floor(now / 1000) + SESSION_AGE}`;
  return `${value}.${sign(value, passwordHash)}`;
}

export function verifyBlogSession(
  token: string,
  passwordHash: string,
  now = Date.now(),
) {
  const [idText, expiresText, signature, extra] = token.split(".");
  const userId = Number(idText);
  const expires = Number(expiresText);
  if (
    extra !== undefined ||
    !Number.isSafeInteger(userId) ||
    userId < 1 ||
    !Number.isSafeInteger(expires) ||
    expires <= Math.floor(now / 1000) ||
    !signature
  ) {
    return null;
  }

  const expected = sign(`${userId}.${expires}`, passwordHash);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
    ? userId
    : null;
}
