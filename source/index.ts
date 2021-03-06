/* 
    ? Commands
*/

import { Clear, System, Echo, Exit, Status, Reload, Help } from "./apps/stream/index.ts";
import { Launcher } from "./apps/launcher/index.ts";
import { Cd, Read } from "./apps/fs/index.ts";
/* 
    ? Modules
*/
import {
  StatusController,
  MemoryStorage,
  readKeypress,
  FileSystem,
  Translator,
  ReadLine,
  Screen,
  Editor,
  Router,
  Canvas,
  Page,
  Path,
} from "./core/std/index.ts";
/* 
    ? Utils
*/
import { Recorder } from "./core/std/others/recorder.ts";
import { join } from "./imports/path.ts";
/* 
    ? Themes
*/
import { getCurrentTheme } from "./core/themes/index.ts";
import { themes } from "./core/themes/themes.ts";
import { Package } from "./apps/package/index.ts";
import { CommandHandler } from "./core/os/handler.ts";

export const enum Constants {
  Settings = "my_term_settings.json",
}

export class Program {
  protected static page = new Page();
  protected static editor = new Editor();
  protected static readline = new ReadLine();
  protected static path = new Path(Deno.cwd());

  protected static geometry = Screen.getScreenGeometry();

  protected static keyboard = {
    read: readKeypress,
  };

  protected static fs = new FileSystem(Program.path);
  protected static router = new Router(Program.path);
  protected static screen = new Screen(Program.geometry);
  protected static canvas = new Canvas(Program.geometry);

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
      new Status(),
      new Reload(),
      new System(),
      new Clear(),
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
    const theme = getCurrentTheme(themes, Program.memory);

    const lastFolder = theme.ShellColors.lastFolder(
      Program.formatLastFolder(Program.router.getLastFolder())
    );

    const userName = theme.ShellColors.name(Program.status.getUserName());
    const userLink = theme.ShellColors.link(Program.router.getUserLink());
    const instance = Program.getProgramInstance();
    const input = theme.Colors.input("\n$");

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
