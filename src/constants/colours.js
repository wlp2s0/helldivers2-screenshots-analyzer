import { rgbaToInt } from 'jimp';

// Primary Colours

export const red = rgbaToInt(255, 0, 0, 255);
export const green = rgbaToInt(0, 255, 0, 255);
export const blue = rgbaToInt(0, 0, 255, 255);
// Secondary Colours
export const yellow = rgbaToInt(255, 255, 0, 255);
export const cyan = rgbaToInt(0, 255, 255, 255);
export const magenta = rgbaToInt(255, 0, 255, 255);

export const targetColours = [
    {
        colour: { r: 255, g: 137, b: 35 },
        label: "primary",
    },
    {
        colour: { r: 116, g: 243, b: 254 },
        label: "secondary",
    }
]