import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";
import { Uninstall } from "./uninstall.ts";
import { Install } from "./install.ts";

class Package implements Command {
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
        const {
            arguments: {
                properties: { uninstall, install, list },
            },
        } = args;

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
        const {
            libraries: { memory },
            initializer,
        } = args;

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

export { Package };
