// Validate base64-encoded image strings

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per image
const VALID_BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

export function validateBase64Image(base64: string): {
  valid: boolean;
  error?: string;
} {
  // Check if it looks like base64
  if (!VALID_BASE64_PATTERN.test(base64)) {
    return { valid: false, error: "Invalid image format" };
  }

  // Estimate size (base64 is ~33% larger than binary)
  const estimatedBytes = (base64.length * 3) / 4;
  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image too large (${Math.round(estimatedBytes / 1024 / 1024)}MB). Max 5MB per image.`,
    };
  }

  return { valid: true };
}

export function validateImages(
  images: string[] | undefined
): { valid: boolean; error?: string } {
  if (!images || images.length === 0) {
    return { valid: true }; // Images are optional
  }

  for (let i = 0; i < images.length; i++) {
    const validation = validateBase64Image(images[i]);
    if (!validation.valid) {
      return {
        valid: false,
        error: `Image ${i + 1}: ${validation.error}`,
      };
    }
  }

  return { valid: true };
}
