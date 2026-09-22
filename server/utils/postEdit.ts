export function isValidPostEdit(
  text: string,
  keptImages: unknown,
  currentImages: string[],
  uploadCount: number,
): keptImages is string[] {
  return text.length <= 5000 &&
    Array.isArray(keptImages) &&
    keptImages.every((image) => typeof image === "string" && currentImages.includes(image)) &&
    new Set(keptImages).size === keptImages.length &&
    keptImages.length + uploadCount <= 9 &&
    Boolean(text.trim() || keptImages.length + uploadCount)
}
