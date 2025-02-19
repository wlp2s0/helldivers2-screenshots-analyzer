import fs, { mkdir } from 'node:fs/promises';
import path, { join } from 'node:path';

import { Jimp, loadFont } from 'jimp';
import { rgbaToInt } from "@jimp/utils";
import { SANS_16_WHITE, SANS_16_BLACK } from "jimp/fonts";

import { mergeRectangles } from './functions/mergeRectangles.js';
import { filterNestedBoxes } from './functions/filterNestedBoxes.js';
import { filterSmallBoxes } from './functions/filterSmallBoxes.js';
import { drawRectangle } from './functions/drawRectangle.js';
import { buildMask } from './functions/buildMask.js';
import { buildBoxes } from './functions/buildBoxes.js';
import { cropImage } from './functions/cropImage.js';
import { matchIcons } from './functions/matchIcons.js';

const fontWhite = await loadFont(SANS_16_WHITE);
const fontBlack = await loadFont(SANS_16_BLACK);

const parseImage = async (filename, sourcePath, targetPath, targetColor, colorTolerance = 30, mergeThreshold = 10, cropRatioWidth = 0.55, cropRatioHeight = 0.6, minWidthThreshold = 20, minHeightThreshold = 20) => {
	const image = await Jimp.read(sourcePath);

	const { croppedImage } = await cropImage(image, targetPath, cropRatioWidth, cropRatioHeight);
	const { width, height } = croppedImage.bitmap;

	// Build mask for the target color
	const mask = buildMask(croppedImage, targetColor, colorTolerance);
	const boxes = buildBoxes(mask, width, height);
	const mergedBoxes = mergeRectangles(boxes, mergeThreshold);
	let filteredBoxes = filterNestedBoxes(mergedBoxes);
	filteredBoxes = filterSmallBoxes(filteredBoxes, minWidthThreshold, minHeightThreshold);
	// Todo: Try to add this filter
	// filteredBoxes = filterBigBoxes(filteredBoxes, 150, 150)

	// Call matchIcons to compare filteredBoxes with icons
	const { matches } = await matchIcons(croppedImage, filteredBoxes);
	let modifiedImage = croppedImage.clone();

	// Draw boxes: Green if matched, Red if unmatched.
	const green = rgbaToInt(0, 255, 0, 255);
	const red = rgbaToInt(255, 0, 0, 255);
	matches.forEach(({ box, minPercentage, mostSimilarIcon }) => {
		const [x, y, w, h] = box;
		const color = minPercentage < 0.5 ? green : red;
		modifiedImage = drawRectangle(modifiedImage, x, y, w, h, color, 2);
		const text = `${minPercentage}@${mostSimilarIcon}`;

		// Draw black contour by printing text at offset positions
		modifiedImage.print({ font: fontBlack, x: x - 1, y: y, text });
		modifiedImage.print({ font: fontBlack, x: x + 1, y: y, text });
		modifiedImage.print({ font: fontBlack, x: x, y: y - 1, text });
		modifiedImage.print({ font: fontBlack, x: x, y: y + 1, text });
		// Print main white text on top
		modifiedImage.print({ font: fontWhite, x: x, y: y, text });
	});

	await modifiedImage.write(targetPath);

	return matches.filter(({ match }) => match === true).length;
}

// Define the target color to be used
const colours = [
	// {
	// 	colour: { r: 255, g: 137, b: 35 },
	// 	label: "primary",
	// },
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
		const filename = file.split(".")[0];
		const sourcePath = path.join(BASE_SCREEN_DIRECTORY, file);
		const targetDir = path.join(BASE_TARGET_DIRECTORY, label);
		await fs.mkdir(targetDir, { recursive: true }); // ensure parsed folder exists
		const targetPath = path.join(targetDir, file);
		const count = await parseImage(filename, sourcePath, targetPath, colour);
		console.log(`Processed ${file} -> ${targetPath}: ${label} ${count} regions annotated`);
	}
}

