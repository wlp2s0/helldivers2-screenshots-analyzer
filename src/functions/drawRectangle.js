
/**
 * Draws a rectangle on the given image.
 *
 * @param {import("@jimp/types").JimpClass} originalImage - The original image object to draw on.
 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {number} colorInt - The color of the rectangle in integer format.
 * @param {number} [thickness=2] - The thickness of the rectangle's border.
 * @returns {Object} The new image object with the rectangle drawn on it.
 */
export function drawRectangle(originalImage, x, y, w, h, colorInt, thickness = 2) {
    const newImage = originalImage.clone()

    // Draw top and bottom lines
    for (let i = 0; i < thickness; i++) {
        for (let xx = x; xx < x + w; xx++) {
            newImage.setPixelColor(colorInt, xx, y + i);
            newImage.setPixelColor(colorInt, xx, y + h - 1 - i);
        }
    }
    // Draw left and right lines
    for (let i = 0; i < thickness; i++) {
        for (let yy = y; yy < y + h; yy++) {
            newImage.setPixelColor(colorInt, x + i, yy);
            newImage.setPixelColor(colorInt, x + w - 1 - i, yy);
        }
    }

    return newImage
}
