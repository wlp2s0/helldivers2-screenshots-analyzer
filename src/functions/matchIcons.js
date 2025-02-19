import fs, { mkdir } from 'fs/promises';
import path, { join } from 'path';
import { Jimp, diff, distance } from 'jimp';

/**
 * Converts an image to monochrome (black and white) using a threshold value.
 * Optionally converts the image to grayscale before applying the threshold.
 *
 * @param {import('@jimp/types').JimpClass} image - The image to be converted.
 * @param {number} thresholdValue - The threshold value to determine black or white.
 * @returns {import('@jimp/types').JimpClass} - The monochrome image.
 */
const toMonochrome = (image, thresholdValue = 0.5) => {
    const newImage = image.clone()
    newImage.threshold({ max: 255 })
    // newImage.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    //     // Get the pixel's grayscale value (the red channel is enough after conversion)
    //     const gray = this.bitmap.data[idx];
    //     // Apply the threshold: if below threshold, set to black; otherwise, set to white
    //     const value = gray < thresholdValue ? 0 : 255;
    //     this.bitmap.data[idx] = value;     // Red
    //     this.bitmap.data[idx + 1] = value; // Green
    //     this.bitmap.data[idx + 2] = value; // Blue
    // });
    return newImage;
}

const randomString = () => {
    return Math.random().toString(36).substring(0, 10);
}

/**
 * Matches icons from a specified directory against regions of an image.
 *
 * @param {import('@jimp/types').JimpClass} image - The image to search for icons within.
 * @param {Array<Array<number>>} filteredBoxes - An array of bounding boxes to search within, each defined as [x, y, w, h].
 * @param {number} [similarityThreshold=0.1] - The threshold for image similarity to consider a match, the smaller the number the more similar the two images must be.
 * @returns {Promise<Object>} An object containing:
 *   - matches: An array of objects, each containing a bounding box and the matched icon file name (or null if no match).
 *   - imageDiffs: An array of objects, each containing the diffed image and the corresponding icon file name.
 */
export const matchIcons = async (image, filteredBoxes) => {
    const iconsDir = path.resolve('./icons');
    const iconFiles = await fs.readdir(iconsDir);
    const matches = [];

    for (const box of filteredBoxes) {
        const [x, y, w, h] = box;
        const boxRegion = image.clone().crop({ x, y, w, h });
        let foundIcon = null;

        // percent: The proportion of different pixels (0-1), where 0 means the two images are pixel identical
        let minPercentage = 2
        let mostSimilarIcon = null

        for (const iconFile of iconFiles) {
            const iconPath = path.join(iconsDir, iconFile);
            const iconImg = await Jimp.read(iconPath);
            const resizedIcon = (iconImg.bitmap.width === w && iconImg.bitmap.height === h)
                ? iconImg
                : iconImg.clone().resize({ w, h });


            const monochromeBoxRegion = toMonochrome(boxRegion);
            const monochromeIcon = toMonochrome(resizedIcon);

            const randomFilename = randomString();
            await mkdir(join("./diffs", randomFilename), { recursive: true });

            await boxRegion.write(join("./diffs", randomFilename, "boxRegion.png"));
            await resizedIcon.write(join("./diffs", randomFilename, "icon.png"));
            await monochromeBoxRegion.write(join("./diffs", randomFilename, "boxRegion.modified.png"));
            await monochromeIcon.write(join("./diffs", randomFilename, "icon.modified.png"));

            // const monochromeDiffResult = diff(monochromeBoxRegion, monochromeIcon);
            const similarity = distance(boxRegion, resizedIcon);

            if (similarity < minPercentage) {
                minPercentage = similarity;
                mostSimilarIcon = iconFile
            }
        }
        matches.push({
            box, matchedIcon: foundIcon, match: foundIcon !== null, minPercentage, mostSimilarIcon
        });
    }

    return { matches };
}
