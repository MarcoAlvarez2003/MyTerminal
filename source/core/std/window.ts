import { readKeypress } from "./keyboard.ts";
import { Screen } from "./graphics.ts";

export type EventMap = "input" | "close" | "start";

export class Component {
    protected events: Record<EventMap, Function> = {
        close: () => {},
        start: () => {},
        input: () => {},
    };

    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;

    public async render(screen: Screen) {}

    public async addEventListener(event: EventMap, fn: Function) {
        this.events[event] = fn;
    }
}

export class Window extends Screen {
    protected components: Component[] = [];
    protected running: boolean = true;

    public append(c: Component) {
        this.components.push(c);
    }

    public async start() {
        while (this.running) {
            for (const component of this.components) {
                await component.render(this);
            }
        }
    }

    public stop() {
        this.running = false;
    }
}

export class Input extends Component {
    public text: string = "";
    public last: string = "";

    constructor(public x: number, public y: number, public w: number, public h: number) {
        super();
    }

    public async render(screen: Screen) {
        this.events.start();

        await this.print(screen);

        for await (const keyPress of readKeypress()) {
            console.clear();

            if (keyPress.key === "return") {
                break;
            }

            if (keyPress.key === "backspace") {
                const length = this.text.length;
                this.back();

                const text = this.text.padEnd(length, " ");
                const last = this.text;

                this.text = text;
                await this.print(screen);
                this.text = last;

                continue;
            }

            this.last = keyPress.sequence;
            this.push(keyPress.sequence);

            this.events.input();

            await this.print(screen);
        }

        console.clear();

        await this.print(screen);

        this.events.close();
    }

    protected push(char: string) {
        this.text += char;
    }

    protected back() {
        this.text = this.text.split("").slice(0, -1).join("");
    }

    protected async print(screen: Screen) {
        this.text = this.text.substring(0, this.w);

        screen.write(this.text, this.x, this.y);
        await screen.print();
    }
}

export class Label extends Component {
    protected screen!: Screen;

    constructor(
        public text: string,
        public x: number,
        public y: number,
        public w: number,
        public h: number
    ) {
        super();
    }

    public async update() {
        await this.render(this.screen);
    }

    public async render(screen: Screen) {
        this.screen = screen;

        this.events.start();

        this.print(screen);

        this.events.close();
    }

    protected async print(screen: Screen) {
        screen.write(this.text, this.x, this.y);
        await screen.print();
    }
}
