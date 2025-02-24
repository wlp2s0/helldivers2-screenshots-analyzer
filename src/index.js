import fs, { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { Jimp } from 'jimp';
import { rgbaToInt } from "@jimp/utils";

import { mergeRectangles } from './functions/mergeRectangles.js';
import { drawRectangle } from './functions/drawRectangle.js';
import { buildMask } from './functions/buildMask.js';
import { buildBoxes } from './functions/buildBoxes.js';
import { cropImage } from './functions/cropImage.js';
import { replaceColor } from './functions/replaceColor.js';
import { getColorPercentage } from './functions/getColorPercentage.js';
import { getThresholds } from './functions/getThresholds.js';

const BASE_DEBUG_DIRECTORY = './debug';

const exposeIconInBox = (box, originalImage, targetColor, tolerance) => {
	const [x, y, w, h] = box;
	const image = originalImage.clone().crop({ x, y, w, h });
	replaceColor(image, targetColor, { r: 255, g: 255, b: 255 }, tolerance);
	return image
}

// Primary Colours
const red = rgbaToInt(255, 0, 0, 255);
const green = rgbaToInt(0, 255, 0, 255);
const blue = rgbaToInt(0, 0, 255, 255);
// Secondary Colours
const yellow = rgbaToInt(255, 255, 0, 255);
const cyan = rgbaToInt(0, 255, 255, 255);
const magenta = rgbaToInt(255, 0, 255, 255);

/**
 * Parses an image to detect and classify areas matching a target color.
 *
 * @param {Object} options - The options for parsing the image.
 * @param {string} options.filename - The name of the file.
 * @param {string} options.label - The label for the image.
 * @param {string} options.sourcePath - The path to the source image.
 * @param {Object} options.targetColor - The target color to detect in the image.
 * @param {number} [options.colorTolerance=45] - The tolerance for color matching.
 * @param {number} [options.minMergeThresholdRatio=0.001] - The ratio for merging close boxes.
 * @param {number} [options.marginThresholdRatio=0.005] - The ratio for determining the margin threshold.
 * @param {number} [options.cropRatioWidth=1] - The width ratio for cropping the image.
 * @param {number} [options.cropRatioHeight=1] - The height ratio for cropping the image.
 * @param {number} [options.minWidthThresholdRatio=0.02] - The minimum width ratio for detected boxes.
 * @param {number} [options.minHeightThresholdRatio=0.025] - The minimum height ratio for detected boxes.
 * @param {number} [options.maxWidthThresholdRatio=0.14] - The maximum width ratio for detected boxes.
 * @param {number} [options.maxHeightThresholdRatio=0.14] - The maximum height ratio for detected boxes.
 * @param {boolean} [options.debug=false] - Whether to enable debug mode.
 * @returns {Promise<Object>} An object containing the classification counts.
 */
const parseImage = async ({
	filename,
	label,
	sourcePath,
	targetColor,
	colorTolerance = 255,
	minMergeThresholdRatio = 0.001,
	maxMergeThresholdRatio = 0.4,
	marginThresholdRatio = 0.0025,
	cropRatioWidth = 1,
	cropRatioHeight = 1,
	minWidthThresholdRatio = 0.02,
	minHeightThresholdRatio = 0.025,
	maxWidthThresholdRatio = 0.14,
	maxHeightThresholdRatio = 0.14,
	debug = false
}) => {
	console.log(`[${label}] Processing ${filename}`);

	// Read the source image.
	const image = await Jimp.read(sourcePath);
	console.log(`[${label}] Read image ${filename}`);

	if (debug) {
		await mkdir(`./${BASE_DEBUG_DIRECTORY}/${filename}`, { recursive: true });
	}

	// Crop the image based on width and height ratios.
	const { croppedImage } = await cropImage(image, cropRatioWidth, cropRatioHeight);
	if (debug) {
		await croppedImage.write(`./${BASE_DEBUG_DIRECTORY}/${filename}/${label}.0.cropped.png`);
	}
	// Retrieve dimensions from the cropped image.
	const { width, height } = croppedImage.bitmap;

	const { marginThreshold, minMergeThreshold, maxMergeThreshold, minWidth, minHeight, maxWidth, maxHeight } = getThresholds({ dimension: height, minMergeThresholdRatio, maxMergeThresholdRatio, marginThresholdRatio, minWidthThresholdRatio, minHeightThresholdRatio, maxWidthThresholdRatio, maxHeightThresholdRatio });

	// Create a mask highlighting areas matching the target color.
	const mask = buildMask(croppedImage, targetColor, colorTolerance);

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
		await maskImage.write(`./${BASE_DEBUG_DIRECTORY}/${filename}/${label}.1.mask.png`);
	}

	// Identify potential boxes from the mask using the dynamic margin threshold.
	const boxes = buildBoxes(mask, width, height, marginThreshold);

	if (debug) {
		let imageBox = maskImage.clone();
		for (const box of boxes) {
			const [x, y, w, h] = box
			imageBox = drawRectangle(imageBox, x, y, w, h, green, 2);
		}
		await imageBox.write(`./${BASE_DEBUG_DIRECTORY}/${filename}/${label}.2.boxes.png`);
	}

	// Merge boxes that are close to each other using the dynamic merge threshold.
	const mergedBoxes = mergeRectangles(boxes, minMergeThreshold, maxMergeThreshold);
	if (debug) {
		let imageMergedBox = maskImage.clone();
		for (const box of mergedBoxes) {
			const [x, y, w, h] = box
			imageMergedBox = drawRectangle(imageMergedBox, x, y, w, h, green, 2);
		}
		await imageMergedBox.write(`./${BASE_DEBUG_DIRECTORY}/${filename}/${label}.3.boxes.merged.png`);
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
				return (x >= ox && y >= oy && x + w <= ox + ow && y + h <= oy + oh);
			});
		})
		// Mark boxes too small.
		.map((box) => ({
			box,
			isSmallBox: box[2] < minWidth || box[3] < minHeight
		}))
		// Mark boxes too big.
		.map(({ box, ...rest }) => ({
			...rest,
			box,
			isBigBox: box[2] > maxWidth || box[3] > maxHeight
		}))
		// Extract sub-image for each box.
		.map(({ box, ...rest }) => ({
			...rest,
			box,
			image: exposeIconInBox(box, croppedImage, targetColor, colorTolerance)
		}))
		// Determine if box image is plain white.
		.map(({ image, ...rest }) => ({
			...rest,
			image,
			isPlainColor: getColorPercentage(image, { r: 255, g: 255, b: 255 }, 0) > 90,
			isNoisy: getColorPercentage(image, { r: 255, g: 255, b: 255 }, 0) < 15,
		}));

	if (debug) {
		let index = 0;
		for (const { box, isPlainColor, isBigBox, isSmallBox, isNoisy, image } of filteredBoxes) {
			if (isPlainColor || isBigBox || isSmallBox || isNoisy) {
				continue
			}

			// const [x, y, w, h] = box;
			// const outputBox = croppedImage.clone().crop({ x, y, w, h });
			// await outputBox.write(`./${BASE_DEBUG_DIRECTORY}/${filename}/${label}.icon.${index}.png`);

			const debugBox = image
			await debugBox.write(`./${BASE_DEBUG_DIRECTORY}/${filename}/${label}.4.${index}.box.png`);

			index++;
		}
	}

	// Clone the cropped image to draw on.
	let maskHighlightedImage
	let originalHighlightedImage
	if (debug) {
		maskHighlightedImage = maskImage.clone();
		originalHighlightedImage = croppedImage.clone();
	}

	// Initialize counters for different box types.
	const match = {
		success: 0,
		plain: 0,
		small: 0,
		big: 0,
		noisy: 0,
	};

	// Draw rectangles around each detected box and update counters accordingly.
	filteredBoxes.forEach(({ box, isPlainColor, isSmallBox, isBigBox, isNoisy }) => {
		const [x, y, w, h] = box;

		let color = null;
		if (isPlainColor) {
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
	});

	// Write the modified image to the target path.
	if (debug) {
		await maskHighlightedImage.write(`./${BASE_DEBUG_DIRECTORY}/${filename}/${label}.5.mask.highlight.png`);
		await originalHighlightedImage.write(`./${BASE_DEBUG_DIRECTORY}/${filename}/${label}.5.highlight.png`);
	}

	// Return the classification counts.
	return match;
}


// Define the target color to be used
const colours = [
	{
		colour: { r: 255, g: 137, b: 35 },
		label: "primary",
	},
	{
		colour: { r: 116, g: 243, b: 254 },
		label: "secondary",
	}
];

const BASE_SCREEN_DIRECTORY = './screenshots';
const files = await fs.readdir(BASE_SCREEN_DIRECTORY);

await Promise.all(colours.map(async ({ colour: targetColor, label }) => {
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const filename = file.split('.')[0];
		try {
			const sourcePath = path.join(BASE_SCREEN_DIRECTORY, file);
			const match = await parseImage({ filename, label, sourcePath, targetColor, debug: true });
			console.log(`[${label}] Processed file ${file} ||| matches: ${JSON.stringify(match)}`);
		} catch (error) {
			console.error(`Error processing ${file}: ${error.message}`);
			throw error;
		}
	}
}))


