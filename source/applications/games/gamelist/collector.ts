import { bgBlue, bgYellow, bgMagenta } from "../../../imports/color.ts";
import { readKeypress } from "../../../components/keyboard.ts";
import { Canvas } from "../../../components/graphics.ts";
import { Coin } from "./objects/coin.ts";

export class Collector {
    protected canvas: Canvas;
    protected x: number = 0;
    protected y: number = 0;
    protected w: number = 2;
    protected h: number = 1;
    protected p: number = 0;
    protected c: Coin;

    constructor() {
        const { columns, rows } = Deno.consoleSize(Deno.stdout.rid);

        this.canvas = new Canvas([columns, rows - 1]);
        const [w, h] = this.canvas.getGeometry();

        this.c = new Coin(w, h);
    }

    public async start() {
        this.draw();

        for await (const { ctrlKey, key } of readKeypress()) {
            if (ctrlKey && key === "c") {
                break;
            }

            if (key === "a") {
                this.moveLeft();
            }

            if (key === "w") {
                this.moveUp();
            }

            if (key === "d") {
                this.moveRight();
            }

            if (key === "s") {
                this.moveDown();
            }

            if (
                this.x + this.w > this.c.x &&
                this.x < this.c.x + this.c.w &&
                this.y + this.h > this.c.y &&
                this.y < this.c.y + this.c.h
            ) {
                const [w, h] = this.canvas.getGeometry();

                this.c = new Coin(w, h);
                this.p++;
            }

            await this.draw();
        }
    }

    protected async draw() {
        const [w, h] = this.canvas.getGeometry();

        console.clear();
        this.canvas.reset();

        /* 
            ? Player And Coin
        */
        this.canvas.style = bgBlue(" ");
        this.canvas.rect(this.x, this.y, this.w, this.h);

        this.c.draw(this.canvas);

        /* 
        ? Information
        */

        this.canvas.style = bgYellow(" ");
        this.canvas.write(`${this.p}`, 1, 1);

        this.canvas.style = bgMagenta(" ");
        this.canvas.write(`points`, 2 + `${this.p}`.length, 1);

        /* 
       ? Coords
       */

        this.canvas.style = bgYellow(" ");
        this.canvas.write(`[${this.x}, ${this.y}]`, 1, h - 1);

        /* 
        ? Paint 
      */
        await this.canvas.print();
    }

    protected moveUp() {
        if (this.y > 0) {
            this.y--;
        }
    }

    protected moveDown() {
        if (this.y + this.h < this.canvas.getGeometry()[1]) {
            this.y++;
        }
    }

    protected moveLeft() {
        if (this.x > 0) {
            this.x--;
        }
    }

    protected moveRight() {
        if (this.x + this.w < this.canvas.getGeometry()[0]) {
            this.x++;
        }
    }
}
