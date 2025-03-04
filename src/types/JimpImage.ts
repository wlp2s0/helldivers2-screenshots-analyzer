import type { Jimp } from "jimp";

/**
 * Helper type for Jimp images.
 * @internal
 */
export type JimpImage = Awaited<ReturnType<(typeof Jimp)["read"]>>;
