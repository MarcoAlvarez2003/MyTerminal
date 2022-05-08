import { Command, RenderArguments, SubCommand } from "../../core/os/handler.ts";
import { Stat, Archive, Directory } from "../../core/std/fs/fsystem.ts";
import { magenta, green, bold } from "../../imports/color.ts";
import { Recorder } from "../../core/std/others/recorder.ts";

/* 
  ? CD
*/

export class Cd implements Command {
  public readonly availCommands: SubCommand[] = [];
  public readonly developer: string = "";
  public readonly targets: RegExp = /cd/;
  public readonly version: string = "v1.0.0";
  public readonly name: string = "cd";

  public async render(args: RenderArguments) {
    const entries = this.getFolders(args);
    const status = args.libraries.status;

    for (const entry of entries) {
      const path = entry.toString();

      switch (path) {
        case "home":
          return status.goHome();

        case "back":
          return status.goBack();

        default:
          await status.go(path);
      }
    }
  }

  protected getFolders(args: RenderArguments) {
    const folders: string[] = [];

    if (Object.keys(args.arguments.properties).length) {
      for (const key in args.arguments.properties) {
        folders.push(key);
      }
    }

    if (args.arguments.entries.length) {
      for (const entry of args.arguments.entries) {
        folders.push(entry.toString());
      }
    }

    return folders;
  }

  public information(args: RenderArguments) {
    const translator = args.libraries.translator;

    console.log(translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    const translator = args.libraries.translator;

    translator.set(this.name, {
      en: {
        information: "Application to manipulate the current route",
      },
      es: {
        information: "Aplicación para manipular la ruta actual",
      },
    });
  }
}

/* 
  ? Read
*/

export class Read implements Command {
  public readonly availCommands: SubCommand[] = [
    {
      type: "boolean",
      name: "url",
    },
  ];
  public readonly developer: string = "";
  public readonly targets: RegExp = /ls/;
  public readonly version: string = "v1.0.0";
  public readonly name: string = "read";
  public recorder = new Recorder();
  public tab: string = "";

  public async render(args: RenderArguments) {
    const { entries, properties } = args.arguments;
    const fs = args.libraries.fs;

    if (entries.length) {
      for (const entry of entries) {
        const path = entry.toString();

        if (properties.url !== undefined) {
          await this.printUrlData(path);
        } else {
          const file = await fs.getArchive(path);

          if (file) {
            this.printArchive(file);
          }
        }
      }
    } else {
      const directory = await fs.getDirectory("");

      if (directory) {
        this.printDirectory(directory);
      }
    }

    this.recorder.print();
  }

  public information(args: RenderArguments) {
    const translator = args.libraries.translator;

    console.log(translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    const translator = args.libraries.translator;

    translator.set(this.name, {
      en: {
        information: "Application for reading files",
      },
      es: {
        information: "Aplicación para leer archivos",
      },
    });
  }

  protected async printUrlData(url: string) {
    const file = await (await fetch(url)).text();

    this.recorder.record(`${this.tab}${magenta("File Url")}: ${green(url)}`);

    this.recorder.record(
      `${this.tab}${magenta("File Body")}: ${green(this.parseBody(file))}`
    );
  }

  protected printStat(stat: Stat) {
    this.recorder.record(`${this.tab}${magenta("File Name")}: ${green(stat.name)}`);
    this.recorder.record(`${this.tab}${magenta("File Size")}: ${stat.size}`);
    this.recorder.record(`${this.tab}${magenta("File Path")}: ${stat.path}`);
  }

  protected printArchive(archive: Archive) {
    this.printStat(archive);

    this.recorder.record(`${this.tab}${magenta("File Type")}: ${archive.extension}`);
    this.recorder.record(
      `${this.tab}${magenta("File Body")}: ${green(this.parseBody(archive.content))}`
    );
  }

  protected parseBody(body: string) {
    return `\n\n\t${body.replace(/\n/g, `\n\t`)}`;
  }

  protected printDirectory(directory: Directory<Stat>) {
    this.recorder.record(
      `${this.tab}${bold(magenta("Directory Name"))}: ${green(directory.name)}`
    );

    const original = this.tab;

    for (const _directory of directory.directories) {
      const original = this.tab;

      this.tab += "\t";

      this.printDirectory(_directory);

      this.tab = original;
    }

    this.tab += "\t";

    for (const stat of directory.files) {
      this.printStat(stat);
    }

    this.tab = original;
  }
}
