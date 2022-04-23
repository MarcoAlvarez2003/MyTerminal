import { bgWhite } from "https://deno.land/std@0.130.0/fmt/colors.ts";
import { Canvas } from "../../../../components/graphics.ts";

export class Coin {
    public x: number = 0;
    public y: number = 0;
    public w: number = 2;
    public h: number = 1;

    constructor(w: number = 10, h: number = 10) {
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h);

        this.x = x;
        this.y = y;

        if (this.x + this.w > w) {
            this.x -= this.w;
        }

        if (this.y + this.h > h) {
            this.y -= this.h;
        }
    }

    public draw(canvas: Canvas) {
        const style = canvas.style;

        canvas.style = bgWhite(" ");
        canvas.rect(this.x, this.y, this.w, this.h);
        canvas.style = style;
    }
}
