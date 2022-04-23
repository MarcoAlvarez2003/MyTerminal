import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";
import { Status } from "./status.ts";
import { Clear } from "./clear.ts";
import { Echo } from "./echo.ts";
import { Exit } from "./exit.ts";
import { Help } from "./help.ts";

export class System implements Command {
    public readonly availCommands: SubCommand[] = [
        {
            type: "boolean",
            name: "clear",
        },
        {
            type: "boolean",
            name: "echo",
        },
        {
            type: "boolean",
            name: "exit",
        },
        {
            type: "boolean",
            name: "help",
        },
        {
            type: "boolean",
            name: "status",
        },
    ];

    public readonly developer: string = "system";
    public readonly targets: RegExp = /system/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "system";

    public async render(args: RenderArguments): Promise<void> {
        const {
            arguments: {
                properties: { clear, echo, exit, help, status },
            },
        } = args;

        if (clear !== undefined) {
            new Clear().render(args);
        }

        if (echo !== undefined) {
            new Echo().render(args);
        }

        if (exit !== undefined) {
            await new Exit().render(args);
        }

        if (help !== undefined) {
            new Help().render(args);
        }

        if (status !== undefined) {
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
