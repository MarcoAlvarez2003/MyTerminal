import { Command, RenderArguments } from "../../components/handler.ts";
import { Stat, Archive, Directory } from "../../components/fsystem.ts";
import { magenta, green, bold } from "../../imports/color.ts";

export class Read implements Command {
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(read|ls|dir)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "read";

    protected tab = "";

    public async render(args: RenderArguments) {
        if (args.arguments.entries.length) {
            for (const path of args.arguments.entries) {
                const file = await args.libraries.fs.getArchive(path.toString());

                if (file) {
                    this.printArchive(file);
                }
            }
        } else {
            const directory = await args.libraries.fs.getDirectory("");

            if (directory) {
                this.printDirectory(directory);
            }
        }
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "Application for reading files",
            },
            es: {
                information: "Aplicación para leer archivos",
            },
        });
    }

    protected printStat(stat: Stat) {
        console.log(`${this.tab}${magenta("File Name")}: ${green(stat.name)}`);
        console.log(`${this.tab}${magenta("File Size")}: ${stat.size}`);
        console.log(`${this.tab}${magenta("File Path")}: ${stat.path}`);
    }

    protected printArchive(archive: Archive) {
        this.printStat(archive);

        console.log(`${this.tab}${magenta("File Type")}: ${archive.extension}`);
        console.log(
            `${this.tab}${magenta("File Body")}: ${green(this.parseBody(archive.content))}`
        );
    }

    protected parseBody(body: string) {
        return `\n\n\t${body.replace(/\n/g, `\n\t`)}`;
    }

    protected printDirectory(directory: Directory<Stat>) {
        console.log(`${this.tab}${bold(magenta("Directory Name"))}: ${green(directory.name)}`);
        const original = this.tab;

        for (const _directory of directory.directories) {
            const original = this.tab;

            this.tab += "\t";

            this.printDirectory(_directory);

            this.tab = original;
        }

        this.tab += "\t";

        for (const stat of directory.files) {
            this.printStat(stat);
        }

        this.tab = original;
    }
}
