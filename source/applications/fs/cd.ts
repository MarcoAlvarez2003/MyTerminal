import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";

export class Cd implements Command {
    public readonly availCommands: SubCommand[] = [];
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(cd|go)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "cd";

    public async render(args: RenderArguments) {
        for (const path of args.arguments.entries) {
            if (path.toString() === "home") {
                args.libraries.status.goHome();
                continue;
            }

            if (path.toString() === "back") {
                args.libraries.status.goBack();
                continue;
            }

            await args.libraries.router.to(path.toString());
        }
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
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
