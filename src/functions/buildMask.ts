import type { JimpImage } from "../types/JimpImage.ts";
import type { TargetColour } from "../types/TargetColour.ts";

/**
 * Generates a mask for an image based on a target color and tolerance.
 *
 * @param image - The image object containing bitmap data.
 * @param color - The target color to match, with properties `r`, `g`, `b`, and `tolerance`.
 * @returns A 2D array representing the mask, where `true` indicates a pixel matches the target color within the specified tolerance.
 */
export const buildMask = (image: JimpImage, { tolerance, ...color }: TargetColour) => {
	// Get image dimensions.
	const { width, height } = image.bitmap;
	// Initialize a 2D array filled with false.
	const mask = Array.from({ length: height }, () => Array(width).fill(false));

	// Scan every pixel of the image.
	image.scan(0, 0, width, height, function (this: JimpImage, x, y, idx) {
		// Read the red, green, and blue values for the current pixel.
		const r = this.bitmap.data[idx + 0];
		const g = this.bitmap.data[idx + 1];
		const b = this.bitmap.data[idx + 2];

		// Check if the pixel color is within the specified tolerance of the target color.
		if (Math.abs(r - color.r) <= tolerance && Math.abs(g - color.g) <= tolerance && Math.abs(b - color.b) <= tolerance) {
			// Mark this pixel in the mask.
			mask[y][x] = true;
		}
	});

	/*
    Visual Example of the return value:
    
    For an image of width = 5 and height = 3, the mask array might look like:
    
    [
      [false, true,  false, false, true ],
      [false, false, true,  false, false],
      [true,  false, false, true,  false]
    ]
    
    Each sub-array represents a row of pixels with 'true' marking matching pixels.
  */
	// Return the generated mask.
	return mask;
};
