import type { Box } from "../types/Box.ts";

/**
 * Determines if two rectangles overlap, considering an optional margin.
 * @internal
 * @param {number[]} a - The first rectangle defined by [x, y, width, height].
 * @param {number[]} b - The second rectangle defined by [x, y, width, height].
 * @param {number} [margin=5] - The optional margin to consider around the rectangles.
 * @returns {boolean} - Returns true if the rectangles overlap, otherwise false.
 */
function rectOverlap(a: number[], b: number[], margin = 5): boolean {
	const [ax, ay, aw, ah] = a;
	const [bx, by, bw, bh] = b;
	return ax < bx + bw + margin && ax + aw + margin > bx && ay < by + bh + margin && ay + ah + margin > by;
}

/**
 * Computes the union of two rectangles.
 * @internal
 * @param {number[]} a - The first rectangle represented as [x, y, width, height].
 * @param {number[]} b - The second rectangle represented as [x, y, width, height].
 * @returns {number[]} The smallest rectangle that contains both input rectangles, represented as [x, y, width, height].
 */
function rectUnion(a: number[], b: number[]): number[] {
	const [ax, ay, aw, ah] = a;
	const [bx, by, bw, bh] = b;
	const x = Math.min(ax, bx);
	const y = Math.min(ay, by);
	const w = Math.max(ax + aw, bx + bw) - x;
	const h = Math.max(ay + ah, by + bh) - y;
	return [x, y, w, h];
}

/**
 * Merges overlapping rectangles with a specified margin.
 * @internal
 * @param {Array<{x: number, y: number, width: number, height: number}>} rectangles - Array of rectangles to merge.
 * @param {number} [minSize=5] - The margin to consider for overlapping rectangles.
 * @param {number} [maxSize=Infinity] - The maximum size for the merged rectangles.
 * @returns {Array<{x: number, y: number, width: number, height: number}>} - Array of merged rectangles.
 */
export function mergeRectangles(rectangles: Array<Box>, minSize = 5, maxSize = 500): Array<Box> {
	let merged = [...rectangles];
	let changed = true;
	while (changed) {
		changed = false;
		const newMerged = [];
		const used = new Array(merged.length).fill(false);
		for (let i = 0; i < merged.length; i++) {
			if (used[i]) {
				continue;
			}
			let current = merged[i];
			for (let j = i + 1; j < merged.length; j++) {
				if (used[j]) {
					continue;
				}
				if (rectOverlap(current, merged[j], minSize)) {
					const candidate = rectUnion(current, merged[j]);
					const [x, y, w, h] = candidate;
					// Check candidate box dimensions: candidate[2] -> width, candidate[3] -> height.
					if (w <= maxSize && h <= maxSize) {
						current = [x, y, w, h];
						used[j] = true;
						changed = true;
					}
				}
			}
			newMerged.push(current);
		}
		merged = newMerged;
	}
	return merged;
}
