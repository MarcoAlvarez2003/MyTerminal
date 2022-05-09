import { Command, SubCommand, RenderArguments } from "../../core/os/handler.ts";
import { MemoryStorage } from "../../core/std/utils/mstore.ts";
import { magenta, bold, green } from "../../imports/color.ts";

/* 
  ? System
*/

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
    const { clear, echo, help, exit, status } = args.arguments.properties;

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

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "System data information",
      },
      es: {
        information: "Información de datos del sistema",
      },
    });
  }
}

/* 
  ? Reload
*/

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

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
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

/* 
  ? Status
*/

export class Status implements Command {
  public readonly availCommands: SubCommand[] = [
    {
      type: "boolean",
      name: "modify",
    },
    {
      type: "boolean",
      name: "delete",
    },
  ];
  public readonly developer: string = "system";
  public readonly targets: RegExp = /(status)/;
  public readonly version: string = "v1.0.0";
  public readonly name: string = "status";

  public render(args: RenderArguments): void {
    const { entries, properties } = args.arguments;

    if (properties.modify !== undefined) {
      if (typeof properties.modify === "string") {
        return this.change(args, properties.modify, entries[0]);
      }

      this.modify(args);
    }

    if (properties.delete !== undefined) {
      return this.delete(args);
    }

    this.show(args);
  }

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "System status information",
      },
      es: {
        information: "Información del estado del sistema",
      },
    });
  }

  protected delete(args: RenderArguments) {
    for (const entry of args.arguments.entries) {
      args.libraries.memory.del(entry.toString());
      console.log(`Deleting ${entry}...`);
    }

    console.log(`Deletion Success`);
  }

  protected change(args: RenderArguments, name: string, value: unknown) {
    args.libraries.memory.set(name, value);
  }

  protected modify({ libraries: { memory } }: RenderArguments) {
    for (const [key, value] of memory) {
      if (confirm(`Do you wanna change ${key}`)) {
        if (typeof value === "string" || typeof value === "number") {
          memory.set(key, prompt(`Enter new value for ${key}`) ?? value);
          continue;
        }

        this.complex(memory, key, value);
      }
    }
  }

  protected complex(memory: MemoryStorage, key: string, value: unknown) {
    console.log(`${key} is too much complex for change`);
    let data: unknown;

    if (confirm("do you want change field per field")) {
      if (value instanceof Array) {
        data = this.complexArray(key, value);
      }

      if (value instanceof Object) {
        data = this.complexObject(key, value as Record<string, unknown>);
      }
    }

    memory.set(key, data);
  }

  protected complexArray(key: string, value: unknown[]) {
    const list: unknown[] = [];

    for (let i = 0; i < value.length; i++) {
      if (list[i] instanceof Array) {
        list[i] = this.complexArray(`${i} of ${key}`, list[i] as unknown[]);
      } else {
        if (confirm(`Do you wanna change index ${i} in ${key}`)) {
          const _value = prompt(`Enter new value for ${key} in position ${i}`);

          if (value) {
            list.push(_value);
          }
        } else {
          list.push(value[i]);
        }
      }
    }
    return list;
  }

  protected complexObject(key: string, value: Record<string, unknown>) {
    const props: Record<string, unknown> = {};

    for (const _key in value) {
      if (value[_key] instanceof Object) {
        console.log(`--- ${_key} ---`);
        props[_key] = this.complexObject(_key, value[_key] as Record<string, unknown>);
      } else {
        if (confirm(`Do you wanna change property ${_key} in ${key}`)) {
          const _value = prompt(`Enter new value for ${key} in id ${_key}`);

          if (_value) {
            props[_key] = _value;
          }
        } else {
          props[_key] = (value as Record<string, unknown>)[_key];
        }
      }
    }

    return props;
  }

  protected show({ libraries: { memory } }: RenderArguments) {
    let elements: [string, unknown][] = [];

    for (const item of memory) {
      elements.push(item);
    }

    elements = elements.sort(([_a, a], [_b, b]) => {
      if (a instanceof Boolean || a instanceof String || a instanceof Number) {
        return 1;
      }

      return -1;
    });

    for (const [key, value] of elements) {
      if (value instanceof Object) {
        console.log(`${magenta("ID")}: ${bold(green(key))}`);

        this.showObject(value as Record<string, unknown>, "\t");
        continue;
      }

      if (value instanceof Array) {
        console.log(`${magenta("ID")}: ${bold(green(key))}`);

        this.showArray(value, "\t");
        continue;
      }

      console.log(`${magenta("ID")}: ${green(key)} -> ${bold(value as string)}`);
    }
  }

  protected showObject(object: Record<string, unknown>, tab: string = "") {
    for (const key in object) {
      const value = object[key];

      if (value instanceof Object) {
        console.log(`${tab}${magenta("ID")}: ${bold(green(key))}`);

        this.showObject(value as Record<string, unknown>, `${tab}\t`);
        continue;
      }

      if (value instanceof Array) {
        console.log(`${tab}${magenta("ID")}: ${bold(green(key))}`);

        this.showArray(value, `${tab}\t`);
        continue;
      }

      console.log(`${tab}${magenta("ID")}: ${green(key)} -> ${object[key]}`);
    }
  }

  protected showArray(array: unknown[], tab: string = "") {
    for (const index in array) {
      const value = array[index];

      if (value instanceof Array) {
        console.log(`${tab}${magenta("ID")}: ${bold(green(index))}`);

        this.showArray(value, `${tab}\t`);
        continue;
      }

      if (value instanceof Object) {
        console.log(`${tab}${magenta("ID")}: ${bold(green(index))}`);

        this.showObject(value as Record<string, unknown>, `${tab}\t`);
        continue;
      }

      console.log(`${tab}${magenta("ID")}: ${bold(index)} -> ${array[index]}`);
    }
  }
}

/* 
  ? Help
*/

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
              const text = libraries.translator.get(cmd.name).get(key);

              console.log(`\t${key}: ${text}`);
            }
          }
        }
      }
    }
  }

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "Get quick help",
      },
      es: {
        information: "Obtiene una ayuda rápida",
      },
    });
  }
}

/* 
  ? Echo
*/

export class Echo implements Command {
  public readonly availCommands: SubCommand[] = [];
  public readonly developer: string = "system";
  public readonly targets: RegExp = /(echo)/;
  public readonly version: string = "v1.0.0";
  public readonly name: string = "echo";

  public render(args: RenderArguments) {
    const recorder = args.libraries.recorder;
    const entries = args.arguments.entries;

    return recorder.record(...entries).getAsText();
  }

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set("echo", {
      en: {
        information: "Official program to print information on the screen",
      },
      es: {
        information: "Programa oficial para imprimir información en la pantalla",
      },
    });
  }
}

/* 
  ? Clear
*/

export class Clear implements Command {
  public readonly availCommands: SubCommand[] = [];
  public readonly developer: string = "system";
  public readonly targets: RegExp = /(clear)/;
  public readonly version: string = "v1.0.0";
  public readonly name: string = "clear";

  public render(args: RenderArguments): void {
    console.clear();
  }

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "Clear the terminal screen",
      },
      es: {
        information: "Limpia la pantalla del terminal",
      },
    });
  }
}

/* 
  ? Exit
*/

export class Exit implements Command {
  public readonly availCommands: SubCommand[] = [
    {
      type: "boolean",
      name: "keep",
    },
  ];

  public readonly developer: string = "system";
  public readonly version: string = "v1.0.0";
  public readonly targets: RegExp = /exit/;
  public readonly name: string = "exit";

  public async render(args: RenderArguments): Promise<void> {
    const properties = args.arguments.properties;
    const memory = args.libraries.memory;

    await memory.save();

    properties.clear !== undefined ? console.clear() : 0;
    Deno.exit();
  }

  public information(args: RenderArguments) {
    console.log(args.libraries.translator.get(this.name).get("information"));
  }

  public update(args: RenderArguments) {
    args.libraries.translator.set(this.name, {
      en: {
        information: "Command to close the program",
      },
      es: {
        information: "Comando para cerrar el programa",
      },
    });
  }
}
