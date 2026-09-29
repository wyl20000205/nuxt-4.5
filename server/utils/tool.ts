const chars = "abcdefghijkmnpqrstuvwxyz23456789";

export const random5 = () =>
  Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
