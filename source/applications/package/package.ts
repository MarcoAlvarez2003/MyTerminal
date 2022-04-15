import { Command, RenderArguments } from "../../components/handler.ts";
import { join, basename } from "../../imports/path.ts";
import { Uninstall } from "./uninstall.ts";
import { Install } from "./install.ts";

class Package implements Command {
    public readonly developer: string = "system";
    public readonly targets: RegExp = /package/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "package";

    protected uninstall = new Uninstall();
    protected install = new Install();

    public async render(args: RenderArguments) {
        if (args.arguments.properties.uninstall !== undefined) {
            return await this.uninstall.render(args);
        }

        if (args.arguments.properties.install !== undefined) {
            return await this.install.render(args);
        }

        if (args.arguments.properties.list !== undefined) {
            this.list(args);
        }
    }

    public async load(args: RenderArguments) {
        if (!args.libraries.memory.has("apps")) {
            args.libraries.memory.set("apps", {});
        }

        const apps = args.libraries.memory.get("apps") as Record<string, string>;

        for (const name in apps) {
            const app = new (await import(apps[name])).default();

            args.initializer.append(app);
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
