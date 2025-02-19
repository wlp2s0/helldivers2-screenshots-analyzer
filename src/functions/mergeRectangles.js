function rectOverlap(a, b, margin = 5) {
    const [ax, ay, aw, ah] = a;
    const [bx, by, bw, bh] = b;
    return (ax < bx + bw + margin && ax + aw + margin > bx &&
        ay < by + bh + margin && ay + ah + margin > by);
}

function rectUnion(a, b) {
    const [ax, ay, aw, ah] = a;
    const [bx, by, bw, bh] = b;
    const x = Math.min(ax, bx);
    const y = Math.min(ay, by);
    const w = Math.max(ax + aw, bx + bw) - x;
    const h = Math.max(ay + ah, by + bh) - y;
    return [x, y, w, h];
}

// Helper: Merge touching/overlapping rectangles
export function mergeRectangles(rects, margin = 5) {
    let merged = [...rects];
    let changed = true;
    while (changed) {
        changed = false;
        const newMerged = [];
        const used = new Array(merged.length).fill(false);
        for (let i = 0; i < merged.length; i++) {
            if (used[i]) continue;
            let current = merged[i];
            for (let j = i + 1; j < merged.length; j++) {
                if (used[j]) continue;
                if (rectOverlap(current, merged[j], margin)) {
                    current = rectUnion(current, merged[j]);
                    used[j] = true;
                    changed = true;
                }
            }
            newMerged.push(current);
        }
        merged = newMerged;
    }
    return merged;
}
