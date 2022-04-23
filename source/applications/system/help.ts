import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";

export class Help implements Command {
    public readonly availCommands: SubCommand[] = [
        {
            type: "boolean",
            name: "info",
        },
        {
            type: "boolean",
            name: "commands",
        },
        {
            type: "boolean",
            name: "translations",
        },
    ];

    public readonly developer: string = "system";
    public readonly version: string = "v1.0.0";
    public readonly targets: RegExp = /help/;
    public readonly name: string = "help";

    public async render(args: RenderArguments): Promise<void> {
        const {
            arguments: { entries, properties },
            initializer,
            libraries,
            ..._
        } = args;

        if (properties.commands !== undefined) {
            if (entries.length) {
                for (const entry of entries) {
                    const cmd = initializer.getCommand(entry.toString());

                    if (cmd) {
                        console.log("command", entry);

                        for (const command of cmd.availCommands) {
                            console.log(`\t${command.name} = <${command.type}>`);
                        }
                    }
                }
            } else {
                for (const commands of initializer) {
                    for (const command of commands) {
                        console.log(`\t${command}`);
                    }
                }
            }
        }

        if (properties.info !== undefined) {
            for (const command of entries) {
                const cmd = initializer.getCommand(command.toString());

                if (cmd) {
                    if (properties.abs !== undefined) {
                        console.log(`Developer: ${cmd.developer ? cmd.developer : "unknown"}`);
                    }

                    console.log(`developer: ${cmd.developer}`);
                    console.log(`version: ${cmd.version}`);
                    console.log(`name: ${cmd.name}`);

                    cmd.information(args);
                }
            }

            console.log();
        }

        if (properties.translations !== undefined) {
            for (const command of entries) {
                const cmd = initializer.getCommand(command.toString());

                if (cmd) {
                    const memory = libraries.translator.all(cmd.name);

                    for (const lang in memory) {
                        console.log("language", lang);

                        for (const key in memory[lang]) {
                            const text = memory[lang][key];

                            console.log(`\t${key}: ${text}`);
                        }
                    }
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
