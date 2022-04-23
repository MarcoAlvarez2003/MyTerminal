import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";
import { Page } from "../../components/network.ts";

export class Browser implements Command {
    public readonly availCommands: SubCommand[] = [];
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(browser)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "browser";

    public async render(args: RenderArguments) {
        if (args.arguments.entries.length > 1) {
            for (let i = 0; i < args.arguments.entries.length; i++) {
                const url = args.arguments.entries[i];

                await Page.request(url.toString());

                if (i < args.arguments.entries.length - 1) {
                    console.log("\n-----\n");
                }
            }

            return;
        }

        if (args.arguments.entries.length) {
            const url = args.arguments.entries[0];
            await Page.request(url.toString());
        }
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "Minimal browser for terminal",
            },
            es: {
                information: "Navegador mínimo para terminal",
            },
        });
    }
}
