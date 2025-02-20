import fs from 'node:fs/promises';
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
 * Parses an image to detect and classify boxes based on color and size thresholds.
 *
 * @param {string} sourcePath - The path to the source image.
 * @param {string} targetPath - The path to save the modified image.
 * @param {Object} targetColor - The target color to detect in the image.
 * @param {number} [colorTolerance=30] - The tolerance for color matching.
 * @param {number} [mergeThreshold=1] - The threshold for merging close rectangles.
 * @param {number} [cropRatioWidth=1] - The width ratio for cropping the image.
 * @param {number} [cropRatioHeight=1] - The height ratio for cropping the image.
 * @param {number} [minWidthThreshold=20] - The minimum width threshold for detected boxes.
 * @param {number} [minHeightThreshold=20] - The minimum height threshold for detected boxes.
 * @param {number} [maxWidthThreshold=150] - The maximum width threshold for detected boxes.
 * @param {number} [maxHeightThreshold=150] - The maximum height threshold for detected boxes.
 * @returns {Promise<Object>} An object containing the count of different types of boxes detected.
 * @returns {number} match.success - The count of successfully detected boxes.
 * @returns {number} match.plain - The count of plain color boxes.
 * @returns {number} match.small - The count of small boxes.
 * @returns {number} match.big - The count of big boxes.
 */
const parseImage = async (
	sourcePath,
	targetPath,
	targetColor,
	colorTolerance = 30,
	mergeThreshold = 1,
	cropRatioWidth = 1,
	cropRatioHeight = 1,
	minWidthThreshold = 20,
	minHeightThreshold = 20,
	maxWidthThreshold = 150,
	maxHeightThreshold = 150
) => {
	// Read the source image.
	const image = await Jimp.read(sourcePath);

	// Crop the image based on width and height ratios.
	const { croppedImage } = await cropImage(image, targetPath, cropRatioWidth, cropRatioHeight);
	// Retrieve dimensions from the cropped image.
	const { width, height } = croppedImage.bitmap;

	// Create a mask highlighting areas matching the target color.
	const mask = buildMask(croppedImage, targetColor, colorTolerance);
	// Identify potential boxes from the mask.
	const boxes = buildBoxes(mask, width, height);
	// Merge boxes that are close to each other.
	const mergedBoxes = mergeRectangles(boxes, mergeThreshold);
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
			isSmallBox: box[2] < minWidthThreshold || box[3] < minHeightThreshold
		}))
		// Mark boxes too big.
		.map(({ box, ...rest }) => ({
			...rest,
			box,
			isBigBox: box[2] > maxWidthThreshold || box[3] > maxHeightThreshold
		}))
		// Extract sub-image for each box.
		.map(({ box, ...rest }) => ({
			...rest,
			box,
			image: exposeIconInBox(box, croppedImage, targetColor, colorTolerance + 20)
		}))
		// Determine if box image is plain white.
		.map(({ image, ...rest }) => ({
			...rest,
			image,
			isPlainColor: getColorPercentage(image, { r: 255, g: 255, b: 255 }, 0) >= 90
		}));

	// Debug: Save each detected box as a separate image.
	//for (const { box } of filteredBoxes) {
	//	const [x, y, w, h] = box;
	//	const image = croppedImage.clone().crop({ x, y, w, h });
	//	await image.write(`./output/${x}-${y}-${w}-${h}.png`);
	//}
	// Clone the cropped image to draw on.
	let modifiedImage = croppedImage.clone();

	// Initialize counters for different box types.
	const match = {
		success: 0,
		plain: 0,
		small: 0,
		big: 0,
	};

	// Draw rectangles around each detected box and update counters accordingly.
	filteredBoxes.forEach(({ box, isPlainColor, isSmallBox, isBigBox }) => {
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
		} else {
			color = green;
			match.success++;
		}

		modifiedImage = drawRectangle(modifiedImage, x, y, w, h, color, 2);
	});

	// Write the modified image to the target path.
	await modifiedImage.write(targetPath);
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

const BASE_SCREEN_DIRECTORY = './screen';
const BASE_TARGET_DIRECTORY = "./parsed";

const files = await fs.readdir(BASE_SCREEN_DIRECTORY);

for (const { colour, label } of colours) {
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		try {
			const sourcePath = path.join(BASE_SCREEN_DIRECTORY, file);
			const targetDir = path.join(BASE_TARGET_DIRECTORY, label);
			await fs.mkdir(targetDir, { recursive: true });
			const targetPath = path.join(targetDir, file);
			const count = await parseImage(sourcePath, targetPath, colour);
			console.log(`[${label}] Processed file ${file} moved to ${targetPath} ||| Success matches: ${count.success}, Plain: ${count.plain}, Small: ${count.small}, Big: ${count.big}`);
		} catch (error) {
			console.error(`Error processing ${file}: ${error.message}`);
			throw error;
		}
	}
}

