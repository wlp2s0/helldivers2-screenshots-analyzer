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
