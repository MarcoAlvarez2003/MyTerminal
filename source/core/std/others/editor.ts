import { white, bold, green } from "../../../imports/color.ts";
import { readKeypress, Keypress } from "./keyboard.ts";

const ascii = {
  block: "█",
};

class Editor {
  protected content: string[] = [""];
  protected column: number = 0;
  protected row: number = 0;

  public onKeyPress = (key: Keypress) => {};

  public async start() {
    for await (const { ctrlKey, key, sequence, ...others } of readKeypress()) {
      if (ctrlKey && key === "c") {
        break;
      }

      if (ctrlKey && key === "w") {
      }
      if (ctrlKey && key === "s") {
      }
      if (ctrlKey && key === "a") {
      }
      if (ctrlKey && key === "d") {
      }

      switch (key) {
        case "backspace":
          this.back();
          break;

        case "return":
          this.jump();
          break;

        default:
          this.push(sequence);
      }

      this.onKeyPress({
        sequence,
        ctrlKey,
        key,
        ...others,
      });

      this.show();
    }
  }

  public get text() {
    return this.content.join("\r\n");
  }

  public get cursor() {
    return {
      column: this.column,
      row: this.row,
    };
  }

  protected show() {
    console.clear();

    for (let i = 0; i < this.content.length - 1; i++) {
      console.log(green(`${i + 1} `) + white(this.content[i]));
    }

    const last = this.content.length - 1;
    console.log(
      green(`${last + 1} `) + white(this.content[last]) + bold(bold(ascii.block))
    );
  }

  protected jump() {
    this.content.push("");
    this.column = 0;
    this.row++;
  }

  protected back() {
    const last = this.content.length - 1;

    this.content[last] = this.content[last].slice(0, -1);
    this.column--;

    if (!this.content[last].length) {
      this.content.pop();
      this.row--;
    }

    if (!this.content.length) {
      this.content.push("");
      this.column = 0;
      this.row = 0;
    }
  }

  protected push(char: string) {
    const last = this.content.length - 1;

    this.content[last] += char;
    this.column++;
  }
}

export { Editor };
