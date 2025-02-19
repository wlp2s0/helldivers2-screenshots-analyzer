/**
 * Performs a flood fill algorithm starting from the given coordinates (sx, sy).
 * It marks all connected cells that match the mask condition and returns the bounding box of the filled area.
 *
 * @param {number} sx - The starting x-coordinate.
 * @param {number} sy - The starting y-coordinate.
 * @param {boolean[][]} mask - A 2D array representing the mask where true indicates fillable cells.
 * @param {boolean[][]} visited - A 2D array representing the visited cells.
 * @param {number} width - The width of the mask and visited arrays.
 * @param {number} height - The height of the mask and visited arrays.
 * @returns {{ box: [number, number, number, number], visited: boolean[][] }} An object containing the bounding box of the filled area and the updated visited array.
 */
export function floodFill(sx, sy, mask, visited, width, height) {
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
