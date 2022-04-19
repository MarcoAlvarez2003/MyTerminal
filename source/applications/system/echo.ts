import { Command, RenderArguments } from "../../components/handler.ts";

export class Echo implements Command {
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(echo)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "echo";

    public render(args: RenderArguments) {
        console.log(...args.arguments.entries);

        return args.arguments.entries.join(" ");
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get("echo").get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set("echo", {
            en: {
                information: "Official program to print information on the screen",
            },
            es: {
                information: "Programa oficial para imprimir información en la pantalla",
            },
        });
    }
}
