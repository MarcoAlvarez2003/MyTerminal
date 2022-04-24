import { green, yellow, bold } from "../../../../imports/color.ts";
import { Theme } from "../type.ts";

export const Ayu: Theme = {
    CurrentFolderColor: (text: string) => bold(green(text)),
    UserLinkColor: (text: string) => bold(yellow(text)),
    UserNameColor: bold,
    AnswerColor: bold,
    InputColor: bold,
};
