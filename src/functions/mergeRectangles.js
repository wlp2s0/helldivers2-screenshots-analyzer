/**
 * Determines if two rectangles overlap, considering an optional margin.
 *
 * @param {number[]} a - The first rectangle defined by [x, y, width, height].
 * @param {number[]} b - The second rectangle defined by [x, y, width, height].
 * @param {number} [margin=5] - The optional margin to consider around the rectangles.
 * @returns {boolean} - Returns true if the rectangles overlap, otherwise false.
 */
function rectOverlap(a, b, margin = 5) {
    const [ax, ay, aw, ah] = a;
    const [bx, by, bw, bh] = b;
    return (ax < bx + bw + margin && ax + aw + margin > bx &&
        ay < by + bh + margin && ay + ah + margin > by);
}

/**
 * Computes the union of two rectangles.
 *
 * @param {number[]} a - The first rectangle represented as [x, y, width, height].
 * @param {number[]} b - The second rectangle represented as [x, y, width, height].
 * @returns {number[]} The smallest rectangle that contains both input rectangles, represented as [x, y, width, height].
 */
function rectUnion(a, b) {
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
 *
 * @param {Array<{x: number, y: number, width: number, height: number}>} rects - Array of rectangles to merge.
 * @param {number} [margin=5] - The margin to consider for overlapping rectangles.
 * @returns {Array<{x: number, y: number, width: number, height: number}>} - Array of merged rectangles.
 */
export function mergeRectangles(rects, margin = 5) {
    let merged = [...rects];
    let changed = true;
    while (changed) {
        changed = false;
        const newMerged = [];
        const used = new Array(merged.length).fill(false);
        for (let i = 0; i < merged.length; i++) {
            if (used[i]) continue;
            let current = merged[i];
            for (let j = i + 1; j < merged.length; j++) {
                if (used[j]) continue;
                if (rectOverlap(current, merged[j], margin)) {
                    current = rectUnion(current, merged[j]);
                    used[j] = true;
                    changed = true;
                }
            }
            newMerged.push(current);
        }
        merged = newMerged;
    }
    return merged;
}
