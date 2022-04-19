/* 
    ? Commands
*/
import { Clear, System, Echo, Exit, Status, Reload, Help } from "./applications/system.ts";
import { Network, Browser } from "./applications/network.ts";
import { Launcher } from "./applications/core.ts";
import { Cd, Read } from "./applications/fs.ts";
import { Games } from "./applications/games.ts";
/* 
    ? Modules
*/
import { readKeypress, Keypress } from "./components/keyboard.ts";
import { StatusController } from "./components/status.ts";
import { Canvas, Screen } from "./components/graphics.ts";
import { CommandHandler } from "./components/handler.ts";
import { Package } from "./applications/package.ts";
import { MemoryStorage } from "./components/mstore.ts";
import { Translator } from "./components/translator.ts";
import { FileSystem } from "./components/fsystem.ts";
import { ReadLine } from "./components/readline.ts";
import { Router } from "./components/router.ts";
import { Editor } from "./components/editor.ts";
import { Page } from "./components/network.ts";
import { Path } from "./components/path.ts";
/* 
    ? Utils
*/
import { green, magenta, yellow, bold } from "./imports/color.ts";
import { join } from "./imports/path.ts";
import { parse } from "./imports/flags.ts";
import { Recorder } from "./components/recorder.ts";

const enum Constants {
    Settings = "my_term_settings.json",
}

class Program {
    protected static page = new Page();
    protected static editor = new Editor();
    protected static readline = new ReadLine();
    protected static path = new Path(Deno.cwd());

    protected static geometry = [
        Deno.consoleSize(Deno.stdout.rid).columns,
        Deno.consoleSize(Deno.stdout.rid).rows,
    ];

    protected static keyboard = {
        read: readKeypress,
    };

    protected static fs = new FileSystem(Program.path);
    protected static router = new Router(Program.path);
    protected static screen = new Screen(...Program.geometry);
    protected static canvas = new Canvas(...Program.geometry);

    protected static memory = new MemoryStorage(
        join(Program.router.getRootLink(), Constants.Settings)
    );

    protected static status = new StatusController(Program.memory, Program.router, {
        username: "username",
        language: "language",
        password: "password",
    });

    protected static translator = new Translator(Program.memory, Program.status);

    protected static recorder = new Recorder();

    protected static handler = new CommandHandler(
        [
            new Package(),
            new Network(),
            new Browser(),
            new Status(),
            new Reload(),
            new System(),
            new Clear(),
            new Games(),
            new Help(),
            new Read(),
            new Echo(),
            new Exit(),
            new Cd(),
        ],
        {
            translator: Program.translator,
            readline: Program.readline,
            keyboard: Program.keyboard,
            recorder: Program.recorder,
            editor: Program.editor,
            memory: Program.memory,
            router: Program.router,
            status: Program.status,
            canvas: Program.canvas,
            screen: Program.screen,
            path: Program.path,
            page: Program.page,
            fs: Program.fs,
        },
        Program.getShellMessage,
        new Launcher()
    );

    public static async main(...source: string[]) {
        await Program.loader();

        if (source.length) {
            await Program.update();
            await Program.render(source);
        }

        await Program.handler.main();
    }

    public static async render(source: string[]) {
        await Program.handler.evaluate(source.join(" "));
    }

    protected static getProgramInstance() {
        const instance = parseInt(Deno.args[0] ?? "0");

        return !!instance ? `(${instance})` : "";
    }

    protected static getShellMessage() {
        const lastFolder = green(Program.formatLastFolder(Program.router.getLastFolder()));
        const userName = magenta(Program.status.getUserName());
        const userLink = yellow(Program.router.getUserLink());
        const instance = Program.getProgramInstance();
        const input = bold("\n$");

        return `${instance} ${lastFolder} ${userName} ${userLink} ${input}`.trim();
    }

    protected static formatLastFolder(folder: string) {
        if (!folder) {
            return Program.router.getUserName();
        }

        return folder;
    }

    protected static async loader() {
        await Program.memory.load();
        console.clear();
    }
    protected static async update() {
        await Program.handler.update();
        console.clear();
    }
}

export { Constants, Program };
