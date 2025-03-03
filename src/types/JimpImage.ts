import type { Jimp } from "jimp";

export type JimpImage = Awaited<ReturnType<typeof Jimp["read"]>>
