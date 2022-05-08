export type ScreenGeometry = [x: number, y: number];

class Screen {
    protected encoder = new TextEncoder();
    protected decoder = new TextDecoder();
    protected storage: string[][] = [];

    constructor(protected geometry: ScreenGeometry = [0, 0]) {
        this.reset();
    }

    public static getScreenGeometry(): ScreenGeometry {
        const geometry = Deno.consoleSize(Deno.stdout.rid);

        return [geometry.columns, geometry.rows];
    }

    public setGeometry(x: number, y: number) {
        this.geometry = [x, y];
    }

    public getGeometry() {
        return this.geometry;
    }

    public drawChar(char: string, x: number, y: number) {
        char = this.parseChar(char);

        for (let row = 0; row < this.storage.length; row++) {
            for (let column = 0; column < this.storage[row].length; column++) {
                column === x && row === y ? (this.storage[row][column] = char) : 0;
            }
        }
    }

    public drawRect(char: string, x: number, y: number, w: number, h: number) {
        const axis = { x, y };

        while (axis.y < y + h) {
            while (axis.x < x + w) {
                this.drawChar(char, axis.x, axis.y);
                axis.x++;
            }

            axis.x = x;
            axis.y++;
        }
    }

    public write(query: string, x: number, y: number, w?: number, h?: number) {
        query = w && h ? this.parseQuery(query, w, h) : query;

        for (const char of query) {
            this.drawChar(char, x++, y);
        }
    }

    public reset() {
        for (let row = 0; row < this.geometry[1]; row++) {
            this.storage[row] = [];

            for (let col = 0; col < this.geometry[0]; col++) {
                this.storage[row][col] = " ";
            }
        }
    }

    public clearRect(x: number, y: number, w: number, h: number) {
        this.drawRect(" ", x, y, w, h);
    }

    public getAsString() {
        return this.storage.map((column) => column.join("")).join("\n");
    }

    public async print() {
        await Deno.stdout.write(this.encoder.encode(this.getAsString()));
    }

    protected parseQuery(query: string, w: number, h: number) {
        const chars = query.split("").filter((char) => {
            if (char === "\n" && h) {
                h--;
                return false;
            }

            return true;
        });

        chars.length = w;

        console.log(chars);

        return chars.join("");
    }

    protected parseChar(char: string) {
        char = char.replace(/(\r|\n)/g, "");

        if (char.length > 1) {
            return char[0];
        }

        return char;
    }
}
class Canvas extends Screen {
    public style: string = "0";

    public rect(x: number, y: number, w: number, h: number) {
        this.drawRect(this.style, x, y, w, h);
    }
}

export { Screen, Canvas };
