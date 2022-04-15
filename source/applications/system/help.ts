import { Command, RenderArguments } from "../../components/handler.ts";

export class Help implements Command {
    public readonly developer: string = "system";
    public readonly version: string = "v1.0.0";
    public readonly targets: RegExp = /help/;
    public readonly name: string = "help";

    public async render(args: RenderArguments): Promise<void> {
        if (args.arguments.properties.commands !== undefined) {
            for (const commands of args.initializer) {
                for (const command of commands) {
                    console.log(`\t${command}`);
                }
            }
        }

        if (args.arguments.properties.info !== undefined) {
            for (const command of args.arguments.entries) {
                const cmd = args.initializer.getCommand(command.toString());

                if (cmd) {
                    if (args.arguments.properties.abs !== undefined) {
                        console.log(`Developer: ${cmd.developer ? cmd.developer : "unknown"}`);
                    }

                    console.log(`developer: ${cmd.developer}`);
                    console.log(`version: ${cmd.version}`);
                    console.log(`name: ${cmd.name}`);

                    cmd.information(args);
                }
            }
        }
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "Get quick help",
            },
            es: {
                information: "Obtiene una ayuda rápida",
            },
        });
    }
}
