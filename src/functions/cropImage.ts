import type { JimpImage } from "../types/JimpImage.js";

/**
 * Crops an image to the specified ratios and saves it to the target path.
 *
 * @param image - The image object to be cropped.
 * @param cropRatioWidth - The width ratio to crop the image. Default is 0.55.
 * @param cropRatioHeight - The height ratio to crop the image. Default is 0.7.
 * @param yCropOffsetRatio - The ratio to offset the crop on the Y-axis. Default is 0.1.
 * @returns - A promise that resolves to an object containing the cropped image.
 */
export async function cropImage(image: JimpImage, cropRatioWidth: number = 0.55, cropRatioHeight: number = 0.7, yCropOffsetRatio: number = 0.1): Promise<JimpImage> {
    const { width, height } = image.bitmap;

    const cropWidth = Math.floor(width * cropRatioWidth);
    const cropHeight = Math.floor(height * cropRatioHeight);
    const cropX = Math.floor((width - cropWidth) / 2);
    const cropY = Math.floor((height - cropHeight) / 2 + height * yCropOffsetRatio);

    return image.clone().crop({ x: cropX, y: cropY, w: cropWidth, h: cropHeight }) as unknown as JimpImage;
}
