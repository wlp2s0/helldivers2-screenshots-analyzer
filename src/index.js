import fs from 'fs/promises';
import path from 'path';
import { Jimp } from 'jimp';
import { rgbaToInt } from "@jimp/utils";

import { mergeRectangles } from './functions/mergeRectangles.js';
import { filterNestedBoxes } from './functions/filterNestedBoxes.js';
import { filterSmallBoxes } from './functions/filterSmallBoxes.js';
import { drawRectangle } from './functions/drawRectangle.js';
import { buildMask } from './functions/buildMask.js';
import { buildBoxes } from './functions/buildBoxes.js';
import { cropImage } from './functions/cropImage.js';
import { filterBigBoxes } from './functions/filterBigBoxes.js';

const parseImage = async (sourcePath, targetPath, targetColor, colorTolerance = 30, mergeThreshold = 10, cropRatioWidth = 0.55, cropRatioHeight = 0.6, minWidthThreshold = 20, minHeightThreshold = 20) => {
	const image = await Jimp.read(sourcePath)

	const { croppedImage } = await cropImage(image, targetPath, cropRatioWidth, cropRatioHeight);
	const { width, height } = croppedImage.bitmap;

	// Build mask for the target color, this matches each pixel with a color within the tolerance range
	const mask = buildMask(croppedImage, targetColor, colorTolerance)
	const boxes = buildBoxes(mask, width, height);
	const mergedBoxes = mergeRectangles(boxes, mergeThreshold);
	let filteredBoxes = filterNestedBoxes(mergedBoxes);
	filteredBoxes = filterSmallBoxes(filteredBoxes, minWidthThreshold, minHeightThreshold);
	// Todo: Try to add this filter
	// filteredBoxes = filterBigBoxes(filteredBoxes, 150, 150)
	// Green for annotation
	const green = rgbaToInt(0, 255, 0, 255);

	filteredBoxes.forEach((box, idx) => {
		const [x, y, w, h] = box;
		drawRectangle(image, x, y, w, h, green, 2);
	});

	await croppedImage.write(targetPath);
	return filteredBoxes.length
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
]

// Iterate over each file in the "screen" directory and call parseImage
const BASE_SCREEN_DIRECTORY = './screen';
const BASE_TARGET_DIRECTORY = "./parsed";

const files = await fs.readdir(BASE_SCREEN_DIRECTORY);


for (const { colour, label } of colours) {
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const sourcePath = path.join(BASE_SCREEN_DIRECTORY, file);
		const targetDir = path.join(BASE_TARGET_DIRECTORY, label);
		await fs.mkdir(targetDir, { recursive: true }); // ensure parsed folder exists
		const targetPath = path.join(targetDir, file);
		// Pass the targetColor argument to parseImage.
		const count = await parseImage(sourcePath, targetPath, colour);
		console.log(`Processed ${file} -> ${targetPath}: ${label} ${count} regions annotated`);
	}
}

