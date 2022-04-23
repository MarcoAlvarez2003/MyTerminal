import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";
import { Browser } from "../network.ts";

export class Network implements Command {
    public readonly availCommands: SubCommand[] = [
        {
            name: "navigate",
            type: "boolean",
        },
    ];
    public readonly developer: string = "system";
    public readonly targets: RegExp = /network/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "network";

    public async render(args: RenderArguments) {
        if (args.arguments.properties.navigate !== undefined) {
            await new Browser().render(args);
        }
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "system network utility",
            },
            es: {
                information: "Herramienta de red del sistema",
            },
        });
    }
}
