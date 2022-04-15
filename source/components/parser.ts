import { parse } from "../imports/flags.ts";

`
settings modify memory key=username "Marco Alvarez"
`;

interface Coords {
    x: number;
    y: number;
}

class Token implements Coords {
    constructor(
        public type: "word" | "string" | "split",
        public body: string,
        public x: number,
        public y: number
    ) {}
}

class Tokenizer {
    protected letters: string[] = [];
    protected tokens: Token[] = [];
    protected index: number = 0;
    protected x: number = 1;
    protected y: number = 1;

    constructor(protected source: string) {
        this.tokenize();
    }

    public getTokensFound() {
        return this.tokens;
    }

    protected tokenize() {
        for (; this.index < this.source.length; this.advance()) {
            const current = this.getCurrentChar();

            switch (current) {
                case "&":
                    this.createNewToken("split", current);
                    break;

                case '"':
                case "'":
                case "`":
                    this.createNewString();
                    break;

                case "\n":
                    this.jump();

                case " ":
                    this.createNewWord();
                    break;

                default:
                    this.letters.push(current);
            }
        }

        this.createNewWord();
    }

    protected createNewToken(type: Token["type"], body: string) {
        this.tokens.push(new Token(type, body, this.x, this.y));
    }

    protected createNewString() {
        const initializer = this.getCurrentChar();
        const letters: string[] = [];
        const x = this.x;
        const y = this.y;

        this.advance();

        for (; this.index < this.source.length; this.advance()) {
            const current = this.getCurrentChar();

            if (current === initializer) {
                break;
            }

            if (current === "\\") {
                this.advance();
                continue;
            }

            letters.push(current);
        }

        const word = letters.join("");

        this.tokens.push(new Token("string", `"${word}"`, x, y));
    }

    protected createNewWord() {
        if (this.letters.join("").length) {
            const word = this.letters.join("");

            const x = this.x - word.length;
            const y = this.y;

            this.tokens.push(new Token("word", word, x, y));

            this.letters.length = 0;
        }
    }

    protected getCurrentChar() {
        return this.source[this.index];
    }

    protected advance() {
        this.index++;
        this.x++;
    }

    protected jump() {
        this.x = 1;
        this.y++;
    }
}

export interface CodeBlock {
    properties: Record<string, string | number>;
    arguments: (string | number)[];
    command: string;
}

class Parser {
    protected codeblocks: CodeBlock[] = [];
    protected tokens: Token[] = [];

    constructor(protected source: string) {
        this.tokens = new Tokenizer(source).getTokensFound();

        this.parse();
    }

    public getCodeBlocksFound() {
        return this.codeblocks;
    }

    protected parse() {
        const codeblocks: string[] = [""];

        for (const token of this.tokens) {
            const last = codeblocks.length - 1;
            const body = token.body;

            if (token.type === "split") {
                codeblocks[last] = codeblocks[last].trim();
                codeblocks.push("");
            } else {
                codeblocks[last] += body + " ";
            }
        }

        for (const codeblock of codeblocks) {
            const { _, ...properties } = parse(codeblock.split(" "));
            const [command, ...values] = _;

            this.codeblocks.push({
                arguments: values.filter((value) => value !== ""),
                command: command.toString(),
                properties,
            });
        }
    }
}

export { Parser, Token, Tokenizer };
