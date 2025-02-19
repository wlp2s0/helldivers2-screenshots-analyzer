// Helper: Draw rectangle on image using pixel manipulation
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
