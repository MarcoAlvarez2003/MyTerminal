import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";
import { basename, join } from "../../imports/path.ts";

export class Install implements Command {
    public readonly availCommands: SubCommand[] = [];
    public readonly developer: string = "system";
    public readonly targets: RegExp = /package/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "install";

    public async render({
        arguments: { entries, properties },
        libraries: { memory, router },
        initializer,
    }: RenderArguments) {
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
                apps[name] = link;

                const app = new (await import(link)).default();
                initializer.append(app);

                console.log(name, "installed from", link);
                memory.set("apps", apps);
            }
        }
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "System App Installer",
            },
            es: {
                information: "Instalador de aplicaciones del sistema",
            },
        });
    }
}
