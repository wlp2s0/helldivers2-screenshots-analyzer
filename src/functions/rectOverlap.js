// Helper: Check if two rectangles overlap with a margin
export function rectOverlap(a, b, margin = 5) {
    const [ax, ay, aw, ah] = a;
    const [bx, by, bw, bh] = b;
    return (ax < bx + bw + margin && ax + aw + margin > bx &&
        ay < by + bh + margin && ay + ah + margin > by);
}
