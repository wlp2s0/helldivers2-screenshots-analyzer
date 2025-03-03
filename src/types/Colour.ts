export interface Colour {
    /**
     * The red channel value of the colour, from 0 to 255.
     */
    r: number;
    /**
     * The green channel value of the colour, from 0 to 255.
     */
    g: number;
    /**
     * The blue channel value of the colour, from 0 to 255.
     */
    b: number;
    /**
     * The alpha channel value of the colour, from 0 to 255.
     */
    a?: number;
}