/**
 * Filters out boxes that are smaller than the specified minimum width and height.
 *
 * @param {Array} boxes - An array of boxes, where each box is represented as an array [x, y, width, height].
 * @param {number} [minWidth=20] - The minimum width a box must have to be included in the result.
 * @param {number} [minHeight=20] - The minimum height a box must have to be included in the result.
 * @returns {Array} - An array of boxes that meet the minimum width and height requirements.
 */
export const filterSmallBoxes = (boxes, minWidth = 20, minHeight = 20) => boxes.filter(box => box[2] >= minWidth && box[3] >= minHeight)

