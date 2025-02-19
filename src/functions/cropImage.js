
/**
 * Crops an image to the specified ratios and saves it to the target path.
 *
 * @param {import("@jimp/types").JimpClass} image - The image object to be cropped.
 * @param {string} targetPath - The path where the cropped image will be saved.
 * @param {number} [cropRatioWidth=0.55] - The width ratio to crop the image. Default is 0.55.
 * @param {number} [cropRatioHeight=0.7] - The height ratio to crop the image. Default is 0.7.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the cropped image.
 */
export async function cropImage(image, targetPath, cropRatioWidth = 0.55, cropRatioHeight = 0.7) {
    const { width, height } = image.bitmap;

    const cropWidth = Math.floor(width * cropRatioWidth);
    const cropHeight = Math.floor(height * cropRatioHeight);
    const cropX = Math.floor((width - cropWidth) / 2);
    const cropY = Math.floor((height - cropHeight) / 2);

    const croppedImage = image.crop({ x: cropX, y: cropY, w: cropWidth, h: cropHeight });
    await croppedImage.write(targetPath);
    return { croppedImage };
}
