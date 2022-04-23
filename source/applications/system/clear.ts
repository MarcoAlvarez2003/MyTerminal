import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";

export class Clear implements Command {
    public readonly availCommands: SubCommand[] = [];
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(clear)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "clear";

    public render(args: RenderArguments): void {
        console.clear();
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "Clear the terminal screen",
            },
            es: {
                information: "Limpia la pantalla del terminal",
            },
        });
    }
}
