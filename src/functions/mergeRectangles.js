import { rectOverlap } from './rectOverlap.js';
import { rectUnion } from './rectUnion.js';

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
