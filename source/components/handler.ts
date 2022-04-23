import { Lexer, Tokenizer, CodeBlock, Token } from "./parser.ts";
import { red, bold } from "../imports/color.ts";
import { StatusController } from "./status.ts";
import { Canvas, Screen } from "./graphics.ts";
import { readKeypress } from "./keyboard.ts";
import { Translator } from "./translator.ts";
import { MemoryStorage } from "./mstore.ts";
import { FileSystem } from "./fsystem.ts";
import { ReadLine } from "./readline.ts";
import { Router } from "./router.ts";
import { Editor } from "./editor.ts";
import { Page } from "./network.ts";
import { Path } from "./path.ts";
import { Recorder } from "./recorder.ts";

type Render<Return = (void | unknown) | Promise<void | unknown>> = (
    args: RenderArguments
) => Return;

type Message = string | (() => string);

export interface SubCommand {
    type: string;
    name: string;
}

export interface Command {
    availCommands: SubCommand[];
    information: Render;
    developer: string;
    targets: RegExp;
    version: string;
    render: Render;
    update: Render;
    name: string;
}

export interface Keyboard {
    read: typeof readKeypress;
}

export interface Libraries {
    status: StatusController;
    memory: MemoryStorage;
    router: Router;
    editor: Editor;
    canvas: Canvas;
    screen: Screen;
    path: Path;
    page: Page;
    fs: FileSystem;
    recorder: Recorder;
    readline: ReadLine;
    keyboard: Keyboard;
    translator: Translator;
}

export interface RenderArguments {
    initializer: CommandHandler;
    libraries: Libraries;
    arguments: Arguments;
}

export interface Arguments {
    properties: Record<string, number | string | boolean>;
    entries: (number | string | boolean)[];
}

class CommandHandler {
    protected isRunning = true;

    constructor(
        protected commands: Command[],
        protected modules: Libraries,
        protected message: Message,
        protected core: Command
    ) {}

    /* 
        ? Manipulate Commands
    */

    public getCommand(command: string) {
        return this.commands.find((cmd) => cmd.targets.test(command));
    }

    public hasCommand(command: string) {
        return !!this.getCommand(command);
    }

    public append(...commands: Command[]) {
        this.commands.push(...commands);
        this.update();
    }

    /*
        ? Manipulate Handler
    */

    public start() {
        this.isRunning = true;
    }

    public stop() {
        this.isRunning = false;
    }

    public async main() {
        this.start();

        await this.update();
        await this.render();

        while (this.isRunning) {
            await this.evaluate(prompt(this.getMessage()) ?? "");
        }
    }

    public async render() {
        await this.core.render(
            this.createHandlerArgument({
                properties: {},
                entries: [],
            })
        );
    }

    public async evaluate(source: string) {
        this.commands.unshift(this.core);

        for (const block of this.compile(source)) {
            const result = await this.engine(block);

            result !== undefined ? console.log(result) : 0;
        }

        this.commands.shift();
    }

    public compile(source: string) {
        return new Lexer(new Tokenizer(source).getTokensFound()).getCodeBlocksFound();
    }

    public async engine(block: CodeBlock) {
        try {
            for (const cmd of this.commands) {
                if (cmd.targets.test(block.command.getAsString())) {
                    const entries = await Promise.all(
                        block.entries.map(async (token) => await this.getTokenValue(token))
                    );

                    const properties: Arguments["properties"] = {};

                    for (const key in block.properties) {
                        const value = block.properties[key];

                        if (value instanceof Token) {
                            const _value = await this.getTokenValue(value);

                            if (_value !== undefined) {
                                properties[key] = _value;
                            }
                        }

                        if (value instanceof CodeBlock) {
                            const _value = await this.engine(value);

                            if (_value !== undefined) {
                                properties[key] = _value as string;
                            }
                        }
                    }

                    return await cmd.render(
                        this.createHandlerArgument({
                            properties,
                            entries,
                        })
                    );
                }
            }
        } catch (e) {
            this.handleErrors(e);
        }
    }

    protected async getTokenValue(token: Token | CodeBlock): Promise<string | number | boolean> {
        if (token instanceof Token) {
            if (token.type === "Boolean") {
                return token.getAsBoolean();
            }

            if (token.type === "String") {
                return token.getAsString();
            }

            if (token.type === "Number") {
                return token.getAsNumber();
            }

            return "";
        }

        const value = await this.engine(token);

        if (value) {
            return value as string;
        }

        return "";
    }

    /* 
        ? Update Apps
    */

    public async update() {
        for (const command of this.commands) {
            await command.update(
                this.createHandlerArgument({
                    properties: {},
                    entries: [],
                })
            );
        }
    }

    /* 
        ? Utils
    */

    public getMessage() {
        return typeof this.message === "string" ? this.message : this.message();
    }

    protected createHandlerArgument(args: Arguments): RenderArguments {
        return {
            initializer: this,
            libraries: this.modules,
            arguments: args,
        };
    }

    /* 
        ? Manipulate Errors
    */

    protected handleErrors(error: unknown) {
        if (error instanceof Error) {
            console.log(red(error.name), bold(error.message));
        }
    }

    /* 
        ? Iterators
    */

    *[Symbol.iterator]() {
        for (const command of this.commands) {
            if (command.targets.source.includes("(")) {
                const commands = command.targets.source.replace(/(\(|\))/g, "").split("|");

                yield commands;
            } else {
                yield [command.targets.source];
            }
        }
    }
}

export { CommandHandler };
