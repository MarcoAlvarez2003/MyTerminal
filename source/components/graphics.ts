import { bgWhite } from "../imports/color.ts";

class Screen {
    protected buffer: string[][] = [];
    protected w: number = 0;
    protected h: number = 0;

    constructor(w?: number, h?: number) {
        this.request(w, h);
        this.clear();
    }

    public setHeight(h: number) {
        this.buffer = [];

        if (h >= 0) {
            this.h = h;
            this.clear();
        }
    }

    public setWidth(w: number) {
        this.buffer = [];

        if (w >= 0) {
            this.w = w;
            this.clear();
        }
    }

    public getHeight() {
        return this.h;
    }

    public geWidth() {
        return this.w;
    }

    public elipse(char: string, x: number, y: number, w: number, h: number) {
        let i: number, angle: number, x1: number, y1: number;

        for (i = 0; i < 360; i++) {
            angle = i;
            x1 = Math.floor(w * Math.cos((angle * Math.PI) / 180));
            y1 = Math.floor(h * Math.sin((angle * Math.PI) / 180));
            this.draw(char, x1, y1);
        }
    }

    public rect(char: string, x: number, y: number, w: number, h: number) {
        let _x = x;
        let _y = y;

        while (_y < y + h) {
            while (_x < x + w) {
                this.draw(char, _x, _y);
                _x++;
            }

            _x = x;
            _y++;
        }
    }

    public write(text: string, x: number, y: number) {
        for (const char of text) {
            this.draw(char, x++, y);
        }
    }

    public draw(char: string, x: number, y: number) {
        for (let row = 0; row < this.h; row++) {
            for (let col = 0; col < this.w; col++) {
                if (x === col && y === row) {
                    this.buffer[row][col] = char;
                }
            }
        }
    }

    public clear() {
        for (let row = 0; row < this.h; row++) {
            this.buffer[row] = [];

            for (let col = 0; col < this.w; col++) {
                this.buffer[row][col] = " ";
            }
        }
    }

    public print() {
        console.log(this.buffer.map((column) => column.join("")).join("\n"));
    }

    protected request(w?: number, h?: number) {
        const request = Deno.consoleSize(Deno.stdout.rid);

        this.w = w ?? request.columns;
        this.h = h ?? request.rows;
    }
}

class Canvas {
    protected screen: Screen;
    protected char: string;

    constructor(w?: number, h?: number) {
        this.screen = new Screen(w, h);
        this.char = bgWhite(" ");
    }

    public get size() {
        return {
            h: this.screen.getHeight(),
            w: this.screen.geWidth(),
        };
    }

    public get h() {
        return this.screen.getHeight();
    }

    public get w() {
        return this.screen.geWidth();
    }

    public set h(h: number) {
        this.screen.setHeight(h);
    }

    public set w(w: number) {
        this.screen.setWidth(w);
    }

    public set color(color: string) {
        this.char = color;
    }

    public write(text: string, x: number, y: number) {
        this.screen.write(text, x, y);
    }

    public elipse(x: number, y: number, w: number, h: number) {
        this.screen.elipse(this.char, x, y, w, h);
    }

    public rect(x: number, y: number, w: number, h: number) {
        this.screen.rect(this.char, x, y, w, h);
    }

    public circle(radius: number, x: number, y: number) {
        this.elipse(x, y, radius, radius);
    }

    public print() {
        this.screen.print();
    }

    public clear() {
        this.screen.clear();
    }
}

export { Screen, Canvas };
