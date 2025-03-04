import { intToRGBA } from "jimp";
import type { JimpImage } from "../types/JimpImage.ts";

/**
 * Extracts the non-black region from the given image.
 *
 * This function scans through the provided image and determines the boundaries
 * of the region that does not contain black pixels (where RGB values are not all zero).
 * It then crops the image to this region and returns the boundaries and the cropped image.
 *
 * @param exposedImage - The image to process, represented as a JimpImage.
 * @returns An object containing the following properties:
 * - `minXBoundary`: The minimum x-coordinate of the non-black region.
 * - `minYBoundary`: The minimum y-coordinate of the non-black region.
 * - `width`: The width of the non-black region.
 * - `height`: The height of the non-black region.
 * - `image`: The cropped image containing only the non-black region.
 */
export const extractNonBlackRegion = (exposedImage: JimpImage) => {
	let minXBoundary = exposedImage.bitmap.width;
	let minYBoundary = exposedImage.bitmap.height;
	let maxXBoundary = 0;
	let maxYBoundary = 0;

	exposedImage.scan(
		0,
		0,
		exposedImage.bitmap.width,
		exposedImage.bitmap.height,
		function (this: JimpImage, x, y) {
			const color = this.getPixelColor(x, y);
			const { r, g, b } = intToRGBA(color);
			if (r === 0 && g === 0 && b === 0) {
				return;
			}
			// Update boundaries.
			if (x < minXBoundary) {
				minXBoundary = x;
			}
			if (y < minYBoundary) {
				minYBoundary = y;
			}
			if (x > maxXBoundary) {
				maxXBoundary = x;
			}
			if (y > maxYBoundary) {
				maxYBoundary = y;
			}
		},
	);
	const width = maxXBoundary - minXBoundary;
	const height = maxYBoundary - minYBoundary;
	const image = exposedImage.clone().crop({
		x: minXBoundary,
		y: minYBoundary,
		w: width,
		h: height,
	}) as unknown as JimpImage;
	return { minXBoundary, minYBoundary, width, height, image };
};
