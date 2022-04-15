import { Command, RenderArguments } from "../../components/handler.ts";
import { Status } from "./status.ts";
import { Clear } from "./clear.ts";
import { Echo } from "./echo.ts";
import { Exit } from "./exit.ts";
import { Help } from "./help.ts";

export class System implements Command {
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(system)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "system";

    public async render(args: RenderArguments): Promise<void> {
        if (args.arguments.properties.clear !== undefined) {
            new Clear().render(args);
        }

        if (args.arguments.properties.echo !== undefined) {
            new Echo().render(args);
        }

        if (args.arguments.properties.exit !== undefined) {
            await new Exit().render(args);
        }

        if (args.arguments.properties.help !== undefined) {
            new Help().render(args);
        }

        if (args.arguments.properties.status !== undefined) {
            new Status().render(args);
        }
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "System data information",
            },
            es: {
                information: "Información de datos del sistema",
            },
        });
    }
}
