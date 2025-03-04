import type { Box } from "./types/Box.ts";
import type { JimpImage } from "./types/JimpImage.ts";
import type { TargetColour } from "./types/TargetColour.ts";

import { mkdir } from "node:fs/promises";
import { Jimp, rgbaToInt } from "jimp";

import { blue, cyan, green, magenta, red, yellow } from "./constants/colours.ts";

import { buildBoxes } from "./functions/buildBoxes.ts";
import { buildMask } from "./functions/buildMask.ts";
import { cropImage } from "./functions/cropImage.ts";
import { drawRectangle } from "./functions/drawRectangle.ts";
import { extractNonBlackRegion } from "./functions/extractNonBlackRegion.ts";
import { getColorPercentage } from "./functions/getColorPercentage.ts";
import { getThresholds } from "./functions/getThresholds.ts";
import { mergeRectangles } from "./functions/mergeRectangles.ts";
import { replaceColor } from "./functions/replaceColor.ts";

/**
 * Exposes an icon within a specified box area of an image by replacing a target color with white.
 *
 * @param box - An array containing the coordinates and dimensions of the box [x, y, w, h].
 * @param originalImage - The original image from which the box area will be cropped.
 * @param targetColor - The color to be replaced within the cropped box area.
 * @returns A new image with the target color replaced by white within the specified box area.
 */
const exposeIconInBox = (box: Box, originalImage: JimpImage, targetColor: TargetColour) => {
	const [x, y, w, h] = box;
	const image = originalImage.clone().crop({ x, y, w, h }) as unknown as JimpImage;
	replaceColor(image, targetColor, { r: 255, g: 255, b: 255 }, targetColor.tolerance);
	return image;
};

/**
 * Arguments for parsing an image.
 *
 * Note that each ratio is based on the image height.
 */
interface ParseImageArgs {
	/**
	 * The name of the file to be parsed.
	 * @example "image"
	 */
	filename: string;
	/**
	 * An optional label used for debugging.
	 * @example "colour-1"
	 */
	label: string;
	/**
	 * The full path to the source image.
	 * @example "/path/to/image.png"
	 */
	sourcePath: string;
	/**
	 * The target color to be detected in the image.
	 */
	targetColor: TargetColour;
	/**
	 * The minimum threshold ratio for merging detected regions.
	 */
	minMergeThresholdRatio?: number;
	/**
	 * The maximum threshold ratio for merging detected regions.
	 */
	maxMergeThresholdRatio?: number;
	/**
	 * The margin threshold ratio for detected regions
	 */
	marginThresholdRatio?: number;
	/**
	 * The width ratio for cropping the image.
	 */
	cropRatioWidth?: number;
	/**
	 * The height ratio for cropping the image.
	 */
	cropRatioHeight?: number;
	/**
	 * The minimum threshold ratio for detected region width.
	 */
	minWidthThresholdRatio?: number;
	/**
	 * The minimum threshold ratio for detected region height.
	 */
	minHeightThresholdRatio?: number;
	/**
	 * The maximum threshold ratio for detected region width.
	 */
	maxWidthThresholdRatio?: number;
	/**
	 * The maximum threshold ratio for detected region height.
	 */
	maxHeightThresholdRatio?: number;
	/**
	 * The proportion of the bounding box for detected regions.
	 */
	allowedBoxProportion?: number;
	/**
	 * The percentage threshold for noise detection.
	 */
	noiseThresholdPercentage?: number;
	/**
	 * The percentage threshold for plain color detection.
	 */
	plainColorThresholdPercentage?: number;
	/**
	 * The vertical offset ratio for cropping the image.
	 */
	yCropOffsetRatio?: number;
	/**
	 * Flag to enable or disable debug mode.
	 */
	debug?: boolean;
	/**
	 * Override the base path for saving debug intermediate images.
	 */
	baseDebugPath?: string;
}

/**
 * Parses an image to detect and classify areas matching a target color.
 *
 * @returns An object containing the classification counts.
 */
export const parseImage = async ({
	filename,
	label,
	sourcePath,
	targetColor,
	minMergeThresholdRatio = 0.001,
	maxMergeThresholdRatio = 0.4,
	minWidthThresholdRatio = 0.015,
	minHeightThresholdRatio = 0.015,
	maxWidthThresholdRatio = 0.14,
	maxHeightThresholdRatio = 0.14,
	debug = false,
	baseDebugPath = "./debug",
	allowedBoxProportion = 3,
	cropRatioWidth = 0.275,
	cropRatioHeight = 0.35,
	noiseThresholdPercentage = 7.5,
	plainColorThresholdPercentage = 90,
	marginThresholdRatio = 0.005,
	yCropOffsetRatio = 0.025,
}: ParseImageArgs) => {
	console.log(`[${label}] Processing ${filename}`);

	// Read the source image.
	const image = await Jimp.read(sourcePath);

	console.log(`[${label}] Read image ${filename}`);

	if (debug) {
		console.warn(`[${label}] Debug mode enabled, writing debug images to ${baseDebugPath}/${filename}`);
		await mkdir(`./${baseDebugPath}/${filename}`, { recursive: true });
		await image.write(`./${baseDebugPath}/${filename}/${label}.0.original.png`);
	}

	// Crop the image based on width and height ratios.
	const croppedImage = await cropImage(image, cropRatioWidth, cropRatioHeight, yCropOffsetRatio);
	if (debug) {
		await croppedImage.write(`./${baseDebugPath}/${filename}/${label}.0.cropped.png`);
	}
	// Retrieve dimensions from the cropped image.
	const { width, height } = croppedImage.bitmap;

	const { marginThreshold, minMergeThreshold, maxMergeThreshold, minWidth, minHeight, maxWidth, maxHeight } = getThresholds({
		dimension: image.bitmap.height,
		minMergeThresholdRatio,
		maxMergeThresholdRatio,
		marginThresholdRatio,
		minWidthThresholdRatio,
		minHeightThresholdRatio,
		maxWidthThresholdRatio,
		maxHeightThresholdRatio,
	});

	// Create a mask highlighting areas matching the target color.
	const mask = buildMask(croppedImage, targetColor);

	// Create an image from the mask for debugging purposes.
	const maskImage = new Jimp({ width: mask[0].length, height: mask.length });
	if (debug) {
		for (let heightIndex = 0; heightIndex < mask.length; heightIndex++) {
			const width = mask[heightIndex];
			for (let widthIndex = 0; widthIndex < width.length; widthIndex++) {
				const maskValue = width[widthIndex];
				if (maskValue === true) {
					maskImage.setPixelColor(rgbaToInt(255, 255, 255, 255), widthIndex, heightIndex);
				} else {
					maskImage.setPixelColor(rgbaToInt(0, 0, 0, 255), widthIndex, heightIndex);
				}
			}
		}
		await maskImage.write(`./${baseDebugPath}/${filename}/${label}.1.mask.png`);
	}

	// Identify potential boxes from the mask using the dynamic margin threshold.
	const boxes = buildBoxes(mask, width, height, marginThreshold);

	if (debug) {
		let imageBox = maskImage.clone() as unknown as JimpImage;
		for (const box of boxes) {
			const [x, y, w, h] = box;
			imageBox = drawRectangle(imageBox, x, y, w, h, green, 2);
		}
		await imageBox.write(`./${baseDebugPath}/${filename}/${label}.2.boxes.png`);
	}

	// Merge boxes that are close to each other using the dynamic merge threshold.
	const mergedBoxes = mergeRectangles(boxes, minMergeThreshold, maxMergeThreshold);
	if (debug) {
		let imageMergedBox = maskImage.clone() as unknown as JimpImage;
		for (const box of mergedBoxes) {
			const [x, y, w, h] = box;
			imageMergedBox = drawRectangle(imageMergedBox, x, y, w, h, green, 2);
		}
		await imageMergedBox.write(`./${baseDebugPath}/${filename}/${label}.3.boxes.merged.png`);
	}

	// Filter and classify boxes (remove nested, check size, expose icon, evaluate plain color percentage).
	const filteredBoxes = mergedBoxes
		// Remove nested boxes.
		.filter((box, i, allElements) => {
			const [x, y, w, h] = box;
			return !allElements.some((other, j) => {
				if (i === j) {
					return false;
				}
				const [ox, oy, ow, oh] = other;
				return x >= ox && y >= oy && x + w <= ox + ow && y + h <= oy + oh;
			});
		})
		// Extract sub-image for each box.
		.map((box) => ({
			box,
			image: exposeIconInBox(box, croppedImage, targetColor),
		}))
		// Auto crop box
		.map(({ box: originalBox, image: exposedImage }) => {
			const { minXBoundary, minYBoundary, width, height, image } = extractNonBlackRegion(exposedImage);
			return {
				box: [minXBoundary, minYBoundary, width, height],
				image,
				originalBox,
			};
		})
		// Mark boxes too small.
		.map(({ box, ...rest }) => ({
			...rest,
			box,
			isSmallBox: box[2] < minWidth || box[3] < minHeight,
		}))
		// Mark boxes too big.
		.map(({ box, ...rest }) => ({
			...rest,
			box,
			isBigBox: box[2] > maxWidth || box[3] > maxHeight,
		}))
		// Determine if box image is plain white.
		.map(({ image, ...rest }) => ({
			...rest,
			image,
			isPlainColor: getColorPercentage(image, { r: 255, g: 255, b: 255 }, 0) > plainColorThresholdPercentage,
			isNoisy: getColorPercentage(image, { r: 255, g: 255, b: 255 }, 0) < noiseThresholdPercentage,
		}))
		// Mark boxes with abnormal width/height proportions.
		.map(({ box, ...rest }) => {
			const [, , w, h] = box;
			// 4:3, 16:9
			const widthRatio = w / h;
			const heightRatio = h / w;
			let isAbnormalProportion = false;
			if (widthRatio > allowedBoxProportion) {
				isAbnormalProportion = true;
			}
			if (heightRatio > allowedBoxProportion) {
				isAbnormalProportion = true;
			}
			return { box, isAbnormalProportion, ...rest };
		});

	if (debug) {
		let index = 0;
		for (const { isPlainColor, isBigBox, isSmallBox, isNoisy, image } of filteredBoxes) {
			if (isPlainColor || isBigBox || isSmallBox || isNoisy) {
				continue;
			}

			// const [x, y, w, h] = box;
			// const outputBox = croppedImage.clone().crop({ x, y, w, h });
			// await outputBox.write(`./${baseDebugPath}/${filename}/${label}.icon.${index}.png`);
			const debugBox = image;
			await debugBox.write(`./${baseDebugPath}/${filename}/${label}.4.${index}.box.png`);

			index++;
		}
	}

	// Clone the cropped image to draw on.
	let maskHighlightedImage: JimpImage | undefined;
	let originalHighlightedImage: JimpImage | undefined;
	if (debug) {
		maskHighlightedImage = maskImage.clone() as unknown as JimpImage;
		originalHighlightedImage = croppedImage.clone() as unknown as JimpImage;
	}

	// Initialize counters for different box types.
	const match = {
		success: 0,
		plain: 0,
		small: 0,
		big: 0,
		noisy: 0,
		abnormal: 0,
	};

	// Draw rectangles around each detected box and update counters accordingly.
	for (const { originalBox, isPlainColor, isSmallBox, isBigBox, isNoisy, isAbnormalProportion } of filteredBoxes) {
		const [x, y, w, h] = originalBox;

		let color = null;
		if (isAbnormalProportion) {
			color = cyan;
			match.abnormal++;
		} else if (isPlainColor) {
			color = red;
			match.plain++;
		} else if (isSmallBox) {
			color = blue;
			match.small++;
		} else if (isBigBox) {
			color = yellow;
			match.big++;
		} else if (isNoisy) {
			color = magenta;
			match.noisy++;
		} else {
			color = green;
			match.success++;
		}

		if (debug && originalHighlightedImage) {
			originalHighlightedImage = drawRectangle(originalHighlightedImage, x, y, w, h, color, 2);
		}
		if (debug && maskHighlightedImage) {
			maskHighlightedImage = drawRectangle(maskHighlightedImage, x, y, w, h, color, 2);
		}
	}

	// Write the modified image to the target path.
	if (debug) {
		await maskHighlightedImage?.write(`./${baseDebugPath}/${filename}/${label}.5.mask.highlight.png`);
		await originalHighlightedImage?.write(`./${baseDebugPath}/${filename}/${label}.5.highlight.png`);
	}

	// Return the classification counts.
	return match;
};
