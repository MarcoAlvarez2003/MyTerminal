import { RenderArguments, Command } from "../../components/handler.ts";
import { Package } from "../package.ts";

export class Launcher implements Command {
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(config|settings|launcher)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "launcher";

    protected package: Package = new Package();
    protected started: boolean = false;

    public async render(args: RenderArguments): Promise<void> {
        await this.secure(args);
        await this.engine(args);
        await this.loader(args);
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "System Default Launcher",
            },
            es: {
                information: "Launcher predeterminado del sistema",
            },
        });
    }

    protected async secure(args: RenderArguments): Promise<void> {
        if (!args.libraries.status.getUserPass()) {
            return;
        }

        if (!this.started) {
            let password: string = "";

            do {
                password = prompt("pass: ") ?? "";
            } while (password !== args.libraries.status.getUserPass());

            this.started = true;
            console.clear();
        }
    }

    protected async engine(args: RenderArguments): Promise<void> {
        if (args.arguments.properties.username !== undefined) {
            const name = args.arguments.properties.username.toString();
            args.libraries.status.changeUserName(name);
        }

        if (args.arguments.properties.password !== undefined) {
            const pass = args.arguments.properties.password.toString();
            args.libraries.status.changeUserPass(pass);
        }

        if (args.arguments.properties.language !== undefined) {
            const lang = args.arguments.properties.language.toString();
            args.libraries.status.changeUserLang(lang);
        }

        if (args.arguments.properties.set !== undefined) {
            await this.setter(args);
        }
    }

    protected async setter(args: RenderArguments): Promise<void> {
        const username = prompt("username:", args.libraries.status.getUserName()) as string;
        const password = prompt("password:", args.libraries.status.getUserPass()) as string;
        const language = prompt("language:", args.libraries.status.getUserLang()) as string;

        args.libraries.status.changeUserName(username);
        args.libraries.status.changeUserPass(password);
        args.libraries.status.changeUserLang(language);
    }

    protected async loader(args: RenderArguments): Promise<void> {
        await this.package.load(args);
    }
}
