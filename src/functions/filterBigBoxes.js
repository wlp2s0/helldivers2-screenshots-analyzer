// Function to filter boxes where both width and height are greater than 30 (or a given threshold)
export const filterBigBoxes = (boxes, maxWidthThreshold = 30, maxHeightThreshold = 30) => boxes.filter(([x, y, w, h]) => w < maxWidthThreshold && h < maxHeightThreshold);
