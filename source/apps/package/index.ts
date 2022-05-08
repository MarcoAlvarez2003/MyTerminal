import { Command, SubCommand, RenderArguments } from "../../core/os/handler.ts";
import { basename, join } from "../../imports/path.ts";

/* 
  ? Package
*/

export class Package implements Command {
  public readonly availCommands: SubCommand[] = [
    {
      type: "boolean",
      name: "install",
    },
    {
      type: "boolean",
      name: "uninstall",
    },
    {
      type: "boolean",
      name: "list",
    },
  ];

  public readonly developer: string = "system";
  public readonly targets: RegExp = /package/;
  public readonly version: string = "v1.0.0";
  public readonly name: string = "package";

  protected uninstall = new Uninstall();
  protected install = new Install();

  public async render(args: RenderArguments) {
    const { uninstall, install, list } = args.arguments.properties;

    if (uninstall !== undefined) {
      return await this.uninstall.render(args);
    }

    if (install !== undefined) {
      return await this.install.render(args);
    }

    if (list !== undefined) {
      this.list(args);
    }
  }

  public async load(args: RenderArguments) {
    const initializer = args.initializer;
    const memory = args.libraries.memory;

    if (!memory.has("apps")) {
      memory.set("apps", {});
    }

    const apps = memory.get("apps") as Record<string, string>;

    for (const name in apps) {
      const app = new (await import(apps[name])).default();

      initializer.append(app);
    }
  }

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "System Package Manager",
      },
      es: {
        information: "Administrador de paquetes del sistema",
      },
    });
  }

  protected list(args: RenderArguments) {
    const applications = args.libraries.memory.get("apps") as Record<string, string>;

    for (const name in applications) {
      console.log(`App Id: ${name} -> ${applications[name]}`);
    }
  }
}

/* 
  ? Install
*/

export class Install implements Command {
  public readonly availCommands: SubCommand[] = [];
  public readonly developer: string = "system";
  public readonly targets: RegExp = /package/;
  public readonly version: string = "v1.0.0";
  public readonly name: string = "install";

  public async render(args: RenderArguments) {
    const { entries, properties } = args.arguments;
    const { memory, router } = args.libraries;
    const initializer = args.initializer;

    if (!memory.has("apps")) {
      memory.set("apps", {});
    }

    for (const path of entries) {
      const apps = memory.get("apps") as Record<string, string>;
      const name = basename(path.toString());

      let link: string | null = null;

      if (properties.absolute !== undefined) {
        link = path.toString();
      } else {
        link = join("file:///", router.getUserLink(), path.toString());
      }

      if (link) {
        console.log("loading module", link);

        const app = new (await import(link)).default();
        initializer.append(app);

        apps[name] = link;

        console.log(name, "installed from", link);
        memory.set("apps", apps);
      }
    }
  }

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "System App Installer",
      },
      es: {
        information: "Instalador de aplicaciones del sistema",
      },
    });
  }
}

/* 
  ? Uninstall
*/

export class Uninstall implements Command {
  public readonly availCommands: SubCommand[] = [];
  public readonly developer: string = "system";
  public readonly targets: RegExp = /uninstall/;
  public readonly version: string = "v1.0.0";
  public readonly name: string = "uninstall";

  public async render(args: RenderArguments) {
    const { entries } = args.arguments;
    const { memory } = args.libraries;

    for (const filename of entries) {
      const applications = memory.get("apps") as Record<string, string>;

      for (const name in applications) {
        if (name.includes(filename.toString())) {
          delete applications[name];
        }
      }

      memory.set("apps", applications);
    }
  }

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "System App Uninstaller",
      },
      es: {
        information: "Desinstalador de aplicaciones del sistema",
      },
    });
  }
}
