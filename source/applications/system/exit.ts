import { Command, RenderArguments } from "../../components/handler.ts";

export class Exit implements Command {
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(exit)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "exit";

    public async render(args: RenderArguments): Promise<void> {
        await args.libraries.memory.save();

        if (args.arguments.properties.keep !== undefined) {
            console.clear();
        }

        Deno.exit();
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "Command to close the program",
            },
            es: {
                information: "Comando para cerrar el programa",
            },
        });
    }
}
