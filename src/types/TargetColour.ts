import type { Colour } from "./Colour.ts";

export interface TargetColour extends Colour {
	/**
	 * The tolerance for the target colour.
	 */
	tolerance: number;
}
