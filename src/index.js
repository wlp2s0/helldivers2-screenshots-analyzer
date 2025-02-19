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

// const fontWhite = await loadFont(SANS_16_WHITE);
// const fontBlack = await loadFont(SANS_16_BLACK);

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
	const image = await Jimp.read(sourcePath);

	const { croppedImage } = await cropImage(image, targetPath, cropRatioWidth, cropRatioHeight);
	const { width, height } = croppedImage.bitmap;

	const mask = buildMask(croppedImage, targetColor, colorTolerance);
	const boxes = buildBoxes(mask, width, height);
	const mergedBoxes = mergeRectangles(boxes, mergeThreshold);
	const filteredBoxes = mergedBoxes
		// Remove nested boxes
		.filter((box, i, allElements) => {
			const [x, y, w, h] = box;
			return !allElements.some((other, j) => {
				// Skip the same box
				if (i === j) {
					return false;
				}
				const [ox, oy, ow, oh] = other;
				return (x >= ox && y >= oy && x + w <= ox + ow && y + h <= oy + oh);
			});
		})
		// Check if the box is too small
		.map((box) => ({
			box,
			isSmallBox: box[2] < minWidthThreshold || box[3] < minHeightThreshold
		}))
		// Check if the box is too big
		.map(({ box, ...rest }) => ({
			...rest,
			box,
			isBigBox: box[2] > maxWidthThreshold || box[3] > maxHeightThreshold
		}))
		.map(({ box, ...rest }) => ({
			...rest,
			box,
			image: exposeIconInBox(box, croppedImage, targetColor, colorTolerance + 20)
		}))
		.map(({ image, ...rest }) => ({
			...rest,
			image,
			isPlainColor: getColorPercentage(image, { r: 255, g: 255, b: 255 }, 0) >= 90
		}))

	let modifiedImage = croppedImage.clone();

	const match = {
		success: 0,
		plain: 0,
		small: 0,
		big: 0,
	}

	filteredBoxes.forEach(({ box, isPlainColor, isSmallBox, isBigBox }) => {
		const [x, y, w, h] = box;

		let color = null;
		if (isPlainColor) {
			color = red
			match.plain++;
		} else if (isSmallBox) {
			color = blue
			match.small++;
		} else if (isBigBox) {
			color = yellow
			match.big++;
		} else {
			color = green;
			match.success++;
		}

		modifiedImage = drawRectangle(modifiedImage, x, y, w, h, color, 2);
	})

	await modifiedImage.write(targetPath);
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
			console.log(`[${label}] Processed ${file} -> ${targetPath}`);
			console.log(`[${label}] Success matches: ${count.success}, Plain: ${count.plain}, Small: ${count.small}, Big: ${count.big}`);
		} catch (error) {
			console.error(`Error processing ${file}: ${error.message}`);
			throw error;
		}
	}
}

