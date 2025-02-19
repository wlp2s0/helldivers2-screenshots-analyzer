// Helper: Union of two rectangles
export function rectUnion(a, b) {
    const [ax, ay, aw, ah] = a;
    const [bx, by, bw, bh] = b;
    const x = Math.min(ax, bx);
    const y = Math.min(ay, by);
    const w = Math.max(ax + aw, bx + bw) - x;
    const h = Math.max(ay + ah, by + bh) - y;
    return [x, y, w, h];
}
