// Helper: Draw rectangle on image using pixel manipulation
export function drawRectangle(img, x, y, w, h, colorInt, thickness = 2) {
    // Draw top and bottom lines
    for (let i = 0; i < thickness; i++) {
        for (let xx = x; xx < x + w; xx++) {
            img.setPixelColor(colorInt, xx, y + i);
            img.setPixelColor(colorInt, xx, y + h - 1 - i);
        }
    }
    // Draw left and right lines
    for (let i = 0; i < thickness; i++) {
        for (let yy = y; yy < y + h; yy++) {
            img.setPixelColor(colorInt, x + i, yy);
            img.setPixelColor(colorInt, x + w - 1 - i, yy);
        }
    }
}
