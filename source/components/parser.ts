export interface Location {
    init: Coords;
    end: Coords;
}

export interface Coords {
    column: number;
    row: number;
}

export enum Entities {
    PipeReference,
    SubCommand,
    Command,
    Boolean,
    String,
    Number,
}

export enum Symbols {
    Skip = "\\",
    Jump = "\n",
    Assign = "=",
    Append = "+",
    Comment = "@",
    TString = "`",
    DString = '"',
    SString = "'",
    EndLine = ";",
    PipeLine = "<",
    Ampersand = "&",
    Separator = ",",
    WhiteSpace = " ",
}

export type TokenType = keyof typeof Entities | keyof typeof Symbols;

export const booleans = /(true|false)/;
export const digits: string[] = ["._01234567890"];

export class Token<BodyType = unknown> implements Location {
    constructor(
        public readonly type: TokenType,
        public readonly body: BodyType,
        public readonly init: Coords,
        public readonly end: Coords
    ) {}

    public getAsString() {
        if (typeof this.body === "string") {
            return this.body;
        }

        return "";
    }

    public getAsNumber() {
        if (typeof this.body === "number") {
            return this.body;
        }

        return NaN;
    }

    public getAsBoolean() {
        if (typeof this.body === "boolean") {
            return this.body;
        }

        return false;
    }
}

export function isBoolean(text: string) {
    return booleans.test(text);
}

export function isNumber(text: string) {
    return !isNaN(parseFloat(text)) && digits.some((digit) => text.includes(digit));
}

export function parseBoolean(text: string) {
    if (isBoolean(text)) {
        if (text === "true") {
            return true;
        }
    }

    return false;
}

export function parseNumber(text: string) {
    if (isNumber(text)) {
        return parseFloat(text);
    }

    return NaN;
}

export function parseStringToNumber(text: string) {
    return text.replace(/_/g, "");
}

export class Tokenizer {
    protected readonly letters: string[] = [];
    protected readonly tokens: Token[] = [];
    protected x: number = 1;
    protected y: number = 1;
    protected i: number = 0;

    constructor(protected source: string) {
        this.tokenize();
    }

    public getTokensFound() {
        return this.tokens;
    }

    protected tokenize() {
        for (; this.eval(); this.next()) {
            const current = this.getCurrentChar();

            switch (current) {
                case Symbols.Ampersand:
                case Symbols.EndLine:
                    this.pushToken(this.makeToken("EndLine", current));
                    break;

                case Symbols.TString:
                case Symbols.DString:
                case Symbols.SString:
                    this.pushToken(this.makeString());
                    break;

                case Symbols.Separator:
                    this.pushToken(this.makeToken("Separator", current));
                    break;

                case Symbols.PipeLine:
                    this.pushToken(this.makeToken("PipeLine", current));
                    break;

                case Symbols.Comment:
                    this.pushToken(this.makeComment());
                    break;

                case Symbols.Append:
                    this.pushToken(this.makeToken("Append", current));
                    break;

                case Symbols.Assign:
                    this.pushToken(this.makeToken("Assign", current));
                    break;

                case Symbols.WhiteSpace:
                case Symbols.Jump:
                    this.makeEntity();
                    break;

                default:
                    this.letters.push(current);
            }
        }

        this.makeEntity();
    }

    protected pushToken(token: Token) {
        this.makeEntity();
        this.tokens.push(token);
    }

    protected makeComment() {
        const elements: string[] = [];

        const init = {
            column: this.x,
            row: this.y,
        };

        this.next();

        for (; this.eval(); this.next()) {
            const current = this.getCurrentChar();

            if (current === Symbols.Jump) {
                break;
            }

            if (
                current === Symbols.TString ||
                current === Symbols.DString ||
                current === Symbols.SString
            ) {
                elements.push(this.makeString().body);
                continue;
            }

            if (current === Symbols.Jump) {
                this.next();
            }

            elements.push(current);
        }

        const end = {
            column: this.x - 1,
            row: this.y,
        };

        return new Token("Comment", elements.join(""), init, end);
    }

    protected makeEntity() {
        const sentence = this.letters.join("").trim();

        if (sentence.length) {
            this.letters.length = 0;

            const init = {
                column: this.x - sentence.length,
                row: this.y,
            };

            const end = {
                column: this.x,
                row: this.y,
            };

            let type: TokenType = "Command";

            if (isBoolean(sentence)) {
                type = "Boolean";
            }

            if (isNumber(sentence)) {
                type = "Number";
            }

            this.tokens.push(new Token(type, sentence, init, end));
        }
    }

    protected makeToken<Type>(type: TokenType, body: Type) {
        const init = {
            column: this.x,
            row: this.y,
        };

        if (body instanceof String) {
            init.column -= body.length;
        }

        return new Token(type, body, init, {
            column: this.x,
            row: this.y,
        });
    }

    protected makeString() {
        const initializer: string = this.getCurrentChar();
        const letters: string[] = [];

        const init = {
            column: this.x,
            row: this.y,
        };

        this.next();

        for (; this.eval(); this.next()) {
            const current = this.getCurrentChar();

            if (current === initializer) {
                break;
            }

            if (current === Symbols.Skip) {
                this.next();

                letters.push(this.getCurrentChar());

                continue;
            }

            if (current === Symbols.Jump) {
                this.jump();
            }

            letters.push(current);
        }

        const end = {
            column: this.x - 1,
            row: this.y,
        };

        return new Token("String", letters.join(""), init, end);
    }

    protected getCurrentChar() {
        return this.source[this.i];
    }

    protected eval() {
        return this.i < this.source.length;
    }

    protected next() {
        this.i++;
        this.x++;
    }

    protected jump() {
        this.y++;
        this.x = 1;
    }
}

export class CodeBlock {
    constructor(
        public command: Token,
        public entries: (Token | CodeBlock)[],
        public properties: Record<string, Token | CodeBlock>
    ) {}
}

export class Lexer {
    protected codeblocks: CodeBlock[] = [];
    protected i: number = 0;

    constructor(protected source: Token[]) {
        this.lex();
    }

    public getCodeBlocksFound() {
        return this.codeblocks;
    }

    protected lex() {
        for (; this.eval(); this.next()) {
            const token = this.getCurrentToken();

            switch (token.type) {
                case "Command":
                    this.codeblocks.push(this.makeCodeBlock());
                    break;
            }
        }
    }

    protected makeCodeBlock() {
        const properties: Record<string, Token | CodeBlock> = {};
        const entries: (Token | CodeBlock)[] = [];
        const command = this.getCurrentToken();

        this.next();

        for (; this.eval(); this.next()) {
            const token = this.getCurrentToken();

            if (token.type === "EndLine") {
                break;
            }

            if (token.type === "PipeLine") {
                this.next();

                const codeblock = this.makeCodeBlock();

                entries.push(codeblock);
                continue;
            }

            if (token.type === "Command") {
                const _properties = this.makeProperty();

                for (const key in _properties) {
                    properties[key] = _properties[key];
                }

                continue;
            }

            entries.push(token);
        }

        return new CodeBlock(command, entries, properties);
    }

    protected makeProperty() {
        const current = this.getCurrentToken();

        if (this.i + 1 in this.source) {
            this.next();

            const next = this.getCurrentToken();

            if (next.type === "PipeLine") {
                this.next();

                const next = this.makeCodeBlock();

                return {
                    [current.getAsString()]: next,
                };
            }

            if (next.type === "Assign") {
                this.next();

                const next = this.getCurrentToken();

                if (next.type === "Command") {
                    return {
                        [current.getAsString()]: new Token(
                            "String",
                            next.body,
                            next.init,
                            next.end
                        ),
                    };
                }

                return {
                    [current.getAsString()]: next,
                };
            }

            this.back();
        }

        return {
            [current.getAsString()]: new Token("Boolean", true, current.init, current.end),
        };
    }

    protected getCurrentToken() {
        return this.source[this.i];
    }

    protected next() {
        return this.i++;
    }

    protected back() {
        return this.i--;
    }

    protected eval() {
        return this.i < this.source.length;
    }
}

await Deno.writeTextFile(
    "settings.json",
    JSON.stringify(
        new Lexer(
            new Tokenizer(await Deno.readTextFile("settings.txt")).getTokensFound()
        ).getCodeBlocksFound()
    )
);
