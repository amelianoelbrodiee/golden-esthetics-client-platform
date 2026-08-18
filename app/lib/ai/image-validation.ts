export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
function signatureMatches(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}
export function validateImageUpload(file: File, bytes: Uint8Array): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) return "Please choose a JPG, PNG, or WebP image.";
  if (!file.size || file.size > MAX_IMAGE_BYTES) return "Please choose an image smaller than 8 MB.";
  if (!signatureMatches(bytes, file.type)) return "That file does not appear to be a valid image.";
  return null;
}
