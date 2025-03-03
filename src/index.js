import fs from 'node:fs/promises';
import path from 'node:path';
import { parseImage } from './parseImage.js';
import { targetColours } from './constants/colours.js';

const BASE_SCREEN_PATH = './screenshots';
const BASE_DEBUG_PATH = './debug';
const files = await fs.readdir(BASE_SCREEN_PATH);

await Promise.all(targetColours.map(async ({ colour: targetColor, label }) => {
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const filename = file.split('.')[0];
		try {
			const sourcePath = path.join(BASE_SCREEN_PATH, file);
			const match = await parseImage({ filename, label, sourcePath, targetColor, debug: true, baseDebugPath: BASE_DEBUG_PATH });
			console.log(`[${label}] Processed file ${file} ||| matches: ${JSON.stringify(match)}`);
		} catch (error) {
			console.error(`Error processing ${file}: ${error.message}`);
			throw error;
		}
	}
}))
