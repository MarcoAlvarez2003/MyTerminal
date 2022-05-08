import { readKeypress } from "../others/keyboard.ts";

class ReadLine {
  protected encoder = new TextEncoder();
  protected decoder = new TextDecoder();

  public async select(message: string, choice: string[]) {
    await this.print(message);

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
      console.clear();

      await this.print(message);

      if (ctrlKey && key === "c") {
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

  public async print(message: string) {
    await Deno.stdout.write(this.encoder.encode(message));
  }

  public async prompt(message: string, length = 1024) {
    const buffer = new Uint8Array({ length });
    await this.print(message + ":");
    await Deno.stdin.read(buffer);

    return this.decoder.decode(buffer);
  }
}

export { ReadLine };
