import { Command, RenderArguments } from "../../components/handler.ts";

export class Uninstall implements Command {
    public readonly developer: string = "system";
    public readonly targets: RegExp = /uninstall/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "uninstall";

    public async render({ arguments: { entries }, libraries: { memory } }: RenderArguments) {
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

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "System App Uninstaller",
            },
            es: {
                information: "Desinstalador de aplicaciones del sistema",
            },
        });
    }
}
