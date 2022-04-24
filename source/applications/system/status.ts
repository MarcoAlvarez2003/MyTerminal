import { Command, RenderArguments, SubCommand } from "../../components/handler.ts";
import { bold, green, magenta } from "../../imports/color.ts";
import { MemoryStorage } from "../../components/mstore.ts";

export class Status implements Command {
    public readonly availCommands: SubCommand[] = [
        {
            type: "boolean",
            name: "modify",
        },
    ];
    public readonly developer: string = "system";
    public readonly targets: RegExp = /(status)/;
    public readonly version: string = "v1.0.0";
    public readonly name: string = "status";

    public render(args: RenderArguments): void {
        const {
            arguments: { properties, entries },
        } = args;

        if (properties.modify !== undefined) {
            if (typeof properties.modify === "string") {
                this.change(args, properties.modify, entries[0]);
            } else {
                this.modify(args);
            }
        }

        this.show(args);
    }

    public information({ libraries: { translator } }: RenderArguments) {
        console.log(translator.get(this.name).get("information"));
    }

    public update({ libraries: { translator } }: RenderArguments) {
        translator.set(this.name, {
            en: {
                information: "System status information",
            },
            es: {
                information: "Información del estado del sistema",
            },
        });
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
