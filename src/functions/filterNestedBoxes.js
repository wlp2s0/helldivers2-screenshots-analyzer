// Helper: Filter out nested boxes
export function filterNestedBoxes(boxes) {
    return boxes.filter((box, i) => {
        const [x, y, w, h] = box;
        return !boxes.some((other, j) => {
            if (i === j) return false;
            const [ox, oy, ow, oh] = other;
            return (x >= ox && y >= oy && x + w <= ox + ow && y + h <= oy + oh);
        });
    });
}
