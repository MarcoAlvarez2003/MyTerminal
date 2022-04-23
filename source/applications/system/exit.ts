import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";

export class Exit implements Command {
    public readonly availCommands: SubCommand[] = [
        {
            type: "boolean",
            name: "keep",
        },
    ];

    public readonly developer: string = "system";
    public readonly version: string = "v1.0.0";
    public readonly targets: RegExp = /exit/;
    public readonly name: string = "exit";

    public async render(args: RenderArguments): Promise<void> {
        const {
            arguments: { properties },
            libraries: { memory },
        } = args;

        await memory.save();

        properties.clear !== undefined ? console.clear() : 0;
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
