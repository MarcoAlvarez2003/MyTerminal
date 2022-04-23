import { Command, RenderArguments, Arguments, SubCommand } from "../../components/handler.ts";

export class Reload implements Command {
    public readonly availCommands: SubCommand[] = [];
    public readonly developer: string = "system";
    public readonly targets: RegExp = /reload/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "reload";

    protected commands: string[] = ["deno", "run"];

    protected permissions: string[] = [
        "--unstable",
        "--allow-read",
        "--allow-write",
        "--allow-net",
        "--allow-run",
    ];

    protected file: string = "source/setup.ts";

    public async render(args: RenderArguments): Promise<void> {
        const instance = (parseInt(Deno.args[0] ?? "0") + 1).toString();

        try {
            const process = Deno.run({
                cmd: [...this.commands, ...this.permissions, this.file, instance],
                stdout: "inherit",
                stderr: "inherit",
                stdin: "inherit",
            });

            if ((await process.status()).success) {
                console.log(this.decode(await process.output()));

                process.close();
            }
        } catch (_) {
            // ignore
        }
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "Test command for development",
            },
            es: {
                information: "Comando de prueba para desarrollo",
            },
        });
    }

    protected decode(buf: Uint8Array): string {
        return new TextDecoder().decode(buf);
    }
}
