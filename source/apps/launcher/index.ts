import { RenderArguments, Command, SubCommand } from "../../core/os/handler.ts";
import { Package } from "../package/index.ts";

export class Launcher implements Command {
  public readonly availCommands: SubCommand[] = [
    {
      type: "boolean",
      name: "modify",
    },
    {
      type: "string",
      name: "username",
    },
    {
      type: "string",
      name: "password",
    },
    {
      type: "string",
      name: "language",
    },
  ];

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

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "System Default Launcher",
      },
      es: {
        information: "Launcher predeterminado del sistema",
      },
    });
  }

  protected async secure(args: RenderArguments): Promise<void> {
    const { status } = args.libraries;

    if (!status.getUserPass()) {
      return;
    }

    if (!this.started) {
      let password: string = "";

      do {
        password = prompt("pass: ") ?? "";
      } while (password !== status.getUserPass());

      this.started = true;
      console.clear();
    }
  }

  protected async engine(args: RenderArguments): Promise<void> {
    const { username, password, language, modify } = args.arguments.properties;
    const { status } = args.libraries;

    if (username !== undefined) {
      const name = username.toString();
      status.changeUserName(name);
    }

    if (password !== undefined) {
      const pass = password.toString();
      status.changeUserPass(pass);
    }

    if (language !== undefined) {
      const lang = language.toString();
      status.changeUserLang(lang);
    }

    if (modify !== undefined) {
      await this.setter(args);
    }
  }

  protected async setter(args: RenderArguments): Promise<void> {
    const { status } = args.libraries;

    const username = prompt("username:", status.getUserName()) as string;
    const password = prompt("password:", status.getUserPass()) as string;
    const language = prompt("language:", status.getUserLang()) as string;

    status.changeUserName(username);
    status.changeUserPass(password);
    status.changeUserLang(language);
  }

  protected async loader(args: RenderArguments): Promise<void> {
    await this.package.load(args);
    console.clear();
  }
}
