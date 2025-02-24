
/**
 * Performs a flood fill algorithm to find the bounding box of a contiguous region in a 2D grid.
 *
 * @param {number} sx - The starting x-coordinate.
 * @param {number} sy - The starting y-coordinate.
 * @param {boolean[][]} mask - A 2D array representing the grid where true indicates fillable cells.
 * @param {boolean[][]} visited - A 2D array representing the cells that have already been visited.
 * @param {number} width - The width of the grid.
 * @param {number} height - The height of the grid.
 * @returns {{ box: [number, number, number, number], visited: boolean[][] }} An object containing the bounding box of the filled region and the updated visited array.
 */
function floodFill(sx, sy, mask, visited, width, height) {
    const newVisited = visited.map(row => row.slice());
    const stack = [[sx, sy]];
    newVisited[sy][sx] = true;
    let minX = sx, maxX = sx, minY = sy, maxY = sy;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (stack.length) {
        const [x, y] = stack.pop();
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height &&
                mask[ny][nx] && !newVisited[ny][nx]) {
                newVisited[ny][nx] = true;
                stack.push([nx, ny]);
            }
        }
    }
    return { box: [minX, minY, maxX - minX + 1, maxY - minY + 1], visited: newVisited };
}



/**
 * Generates bounding boxes around contiguous regions in a binary mask.
 *
 * @param {boolean[][]} mask - A 2D array representing the binary mask where 1 indicates the presence of a region and 0 indicates the absence.
 * @param {number} width - The width of the mask.
 * @param {number} height - The height of the mask.
 * @param {number} [boxMargin=5] - The margin to add around each bounding box.
 * @returns {Array.<Array.<number>>} An array of bounding boxes, where each box is represented as an array [x, y, width, height].
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
