/**
 * Builds a mask for an image based on a specified color and tolerance.
 *
 * @param {import("@jimp/types").JimpClass} image - The image object to process.
 * @param {Object} color - The target color to create the mask for.
 * @param {number} color.r - The red component of the target color.
 * @param {number} color.g - The green component of the target color.
 * @param {number} color.b - The blue component of the target color.
 * @param {number} tolerance - The tolerance value for color matching.
 * @returns {boolean[][]} A 2D array representing the mask, where `true` indicates a pixel within the tolerance range.
 */
export const buildMask = (image, color, tolerance) => {
    const { width, height } = image.bitmap
    const mask = Array.from({ length: height }, () => Array(width).fill(false));
    // Create mask: mark pixels within tolerance
    image.scan(0, 0, width, height, function (x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        if (Math.abs(r - color.r) <= tolerance &&
            Math.abs(g - color.g) <= tolerance &&
            Math.abs(b - color.b) <= tolerance) {
            mask[y][x] = true;
        }
    });
    return mask;
};
