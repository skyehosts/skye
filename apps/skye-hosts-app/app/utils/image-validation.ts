import type { PickedImage } from "../services/image-picker";

const MIN_ASPECT_RATIO = 3 / 4; // 0.75 — tallest allowed (portrait 3:4)
const MAX_ASPECT_RATIO = 16 / 9; // ~1.78 — widest allowed (landscape 16:9)

/**
 * Returns indices of images whose aspect ratio falls outside the
 * supported 3:4 (portrait) to 16:9 (landscape) range.
 */
export function validateImageAspectRatios(images: PickedImage[]): number[] {
  const invalid: number[] = [];

  for (let i = 0; i < images.length; i++) {
    const { width, height } = images[i];
    if (width <= 0 || height <= 0) {
      invalid.push(i);
      continue;
    }
    const ratio = width / height;
    if (ratio < MIN_ASPECT_RATIO || ratio > MAX_ASPECT_RATIO) {
      invalid.push(i);
    }
  }

  return invalid;
}
