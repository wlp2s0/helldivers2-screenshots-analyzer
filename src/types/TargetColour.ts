import type { Colour } from "./Colour.js";

export interface TargetColour extends Colour {
    tolerance: number;
}