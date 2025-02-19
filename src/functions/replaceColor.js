import { rgbaToInt, intToRGBA } from 'jimp';

export function replaceColor(image, oldColor, newColor, tolerance = 30, margin = 0) {
    // Convert RGB objects to integer values
    const oldColorInt = rgbaToInt(oldColor.r, oldColor.g, oldColor.b, oldColor.a ?? 255);
    const newColorInt = rgbaToInt(newColor.r, newColor.g, newColor.b, newColor.a ?? 255);
    const placeholderColorInt = rgbaToInt(0, 0, 0, 255);
    const { width, height } = image.bitmap;

    image.scan(0, 0, width, height, function (x, y) {
        const pixelInt = this.getPixelColor(x, y);
        const { r, g, b } = intToRGBA(pixelInt);
        if (
            Math.abs(r - oldColor.r) <= tolerance &&
            Math.abs(g - oldColor.g) <= tolerance &&
            Math.abs(b - oldColor.b) <= tolerance
        ) {
            // Replace the matching pixel and its neighbors
            for (let dx = -margin; dx <= margin; dx++) {
                for (let dy = -margin; dy <= margin; dy++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
                        this.setPixelColor(newColorInt, nx, ny);
                    }
                }
            }
        } else {
            this.setPixelColor(placeholderColorInt, x, y);
        }
    });
    return image;
}
