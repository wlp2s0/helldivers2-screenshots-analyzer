import { intToRGBA, rgbaToInt } from "jimp";
import type { Colour } from "../types/Colour.ts";
import type { JimpImage } from "../types/JimpImage.ts";

/**
 * Replaces a specified color in an image with a new color, within a given tolerance and margin.
 *
 * @param image - The image object to process.
 * @param {Object} oldColor - The color to be replaced, as an object with r, g, b, and optional a properties.
 * @param {Object} newColor - The new color to apply, as an object with r, g, b, and optional a properties.
 * @param {number} [tolerance=30] - The tolerance level for color matching (default is 30).
 * @param {number} [margin=0] - The margin around the matching pixel to also replace (default is 0).
 * @returns {Object} - The modified image object.
 */
export function replaceColor(image: JimpImage, oldColor: Colour, newColor: Colour, tolerance = 30, margin = 0): object {
	// Convert RGB objects to integer values
	const oldColorInt = rgbaToInt(oldColor.r, oldColor.g, oldColor.b, oldColor.a ?? 255);
	const newColorInt = rgbaToInt(newColor.r, newColor.g, newColor.b, newColor.a ?? 255);
	const placeholderColorInt = rgbaToInt(0, 0, 0, 255);
	const { width, height } = image.bitmap;

	image.scan(0, 0, width, height, function (this: JimpImage, x, y) {
		const pixelInt = this.getPixelColor(x, y);
		const { r, g, b } = intToRGBA(pixelInt);
		if (Math.abs(r - oldColor.r) <= tolerance && Math.abs(g - oldColor.g) <= tolerance && Math.abs(b - oldColor.b) <= tolerance) {
			// Replace the matching pixel and its neighbors
			for (let dx = -margin; dx <= margin; dx++) {
				for (let dy = -margin; dy <= margin; dy++) {
					const nx = x + dx;
					const ny = y + dy;
					if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
						this.setPixelColor(newColorInt, nx, ny);
					}
				}
			}
		} else {
			this.setPixelColor(placeholderColorInt, x, y);
		}
	});
	return image;
}
