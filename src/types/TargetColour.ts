import type { Colour } from "./Colour.ts";

export interface TargetColour extends Colour {
    tolerance: number;
}