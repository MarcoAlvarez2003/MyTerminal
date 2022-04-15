import { readKeypress } from "./keyboard.ts";

class ReadLine {
    public static async select(message: string, choice: string[]) {
        ReadLine.print(message);

        let index = 0;

        console.log(
            choice
                .map((choice, i) => {
                    if (i === index) {
                        return `(*) ${choice}`;
                    }

                    return `( ) ${choice}`;
                })
                .join("\n")
        );

        for await (const { ctrlKey, key } of readKeypress()) {
            if (ctrlKey && key === key) {
                break;
            }

            if (key === "return") {
                break;
            }

            if (key === "w") {
                index--;
            }

            if (key === "s") {
                index++;
            }

            if (index >= choice.length) {
                index = 0;
            }

            if (index < 0) {
                index = choice.length - 1;
            }

            console.log(
                choice
                    .map((choice, i) => {
                        if (i === index) {
                            return `(*) ${choice}`;
                        }

                        return `( ) ${choice}`;
                    })
                    .join("\n")
            );
        }

        return choice[index];
    }

    public static print(message: string) {
        console.log(message);
        console.clear();
    }
}

export { ReadLine };
