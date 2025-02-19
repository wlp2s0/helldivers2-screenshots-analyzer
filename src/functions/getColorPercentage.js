import { intToRGBA } from 'jimp';

export function getColorPercentage(image, targetColor, tolerance = 0) {
    const { width, height } = image.bitmap;
    let matchCount = 0;
    const totalPixels = width * height;

    image.scan(0, 0, width, height, function (x, y) {
        const pixelInt = this.getPixelColor(x, y);
        const { r, g, b } = intToRGBA(pixelInt);
        if (
            Math.abs(r - targetColor.r) <= tolerance &&
            Math.abs(g - targetColor.g) <= tolerance &&
            Math.abs(b - targetColor.b) <= tolerance
        ) {
            matchCount++;
        }
    });

    return (matchCount / totalPixels) * 100;
}
