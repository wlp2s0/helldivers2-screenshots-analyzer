import type { JimpImage } from '../types/JimpImage.ts';
import type { Colour } from '../types/Colour.ts';
import { intToRGBA } from 'jimp';

/**
 * Calculates the percentage of pixels in an image that match a target color within a given tolerance.
 *
 * @param {JimpImage} image - The image object containing bitmap data.
 * @param {Object} targetColor - The target color to match against, with properties r, g, and b.
 * @param {number} [tolerance=0] - The tolerance value for color matching (default is 0).
 * @returns {number} - The percentage of pixels that match the target color within the specified tolerance.
 */
export function getColorPercentage(image: JimpImage, targetColor: Colour, tolerance: number = 0): number {
    const { width, height } = image.bitmap;
    let matchCount = 0;
    const totalPixels = width * height;

    image.scan(0, 0, width, height, function (this: JimpImage, x, y) {
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
