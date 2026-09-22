type ImageUrlEdit = { expectedImages: string[]; images: string[] }

export function isValidPostImageUrlEdit(value: unknown): value is ImageUrlEdit {
  if (!value || typeof value !== "object") return false
  const { expectedImages, images } = value as Partial<ImageUrlEdit>
  if (!Array.isArray(expectedImages) || !Array.isArray(images) ||
      expectedImages.length > 9 || images.length < expectedImages.length || images.length > 9 ||
      !expectedImages.every((image) => typeof image === "string") ||
      new Set(images).size !== images.length) return false

  return images.every((image, index) => {
    if (typeof image !== "string") return false
    if (image === expectedImages[index]) return true
    if (image.length > 4096 || image !== image.trim()) return false
    try {
      const url = new URL(image)
      return (url.protocol === "http:" || url.protocol === "https:") &&
        Boolean(url.hostname) && !url.username && !url.password
    } catch {
      return false
    }
  })
}
