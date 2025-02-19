import { floodFill } from './floodFill.js';

/**
 * Generates an array of boxes from a given mask, width, and height.
 *
 * @param {Array<Array<number>>} mask - A 2D array representing the mask where each element is either 0 or 1.
 * @param {number} width - The width of the mask.
 * @param {number} height - The height of the mask.
 * @returns {Array<Object>} An array of box objects, each representing a contiguous area in the mask.
 */
export const buildBoxes = (mask, width, height, boxMargin = 5) => {
    let boxes = [];
    // Keep track of visited pixels
    let visited = Array.from({ length: height }, () => Array(width).fill(false));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (mask[y][x] && !visited[y][x]) {
                const { box, visited: newVisited } = floodFill(x, y, mask, visited, width, height);
                // Expand box 
                let [minX, minY, w, h] = box;
                const newX = Math.max(minX - boxMargin, 0);
                const newY = Math.max(minY - boxMargin, 0);
                const newWidth = Math.min(w + boxMargin * 2, width - newX);
                const newHeight = Math.min(h + boxMargin * 2, height - newY);
                boxes.push([newX, newY, newWidth, newHeight]);
                visited = newVisited;
            }
        }
    }
    return boxes;
};
