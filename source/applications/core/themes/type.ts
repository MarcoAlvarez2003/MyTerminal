export type ColorCallback = (text: string) => string;

export interface Theme {
    CurrentFolderColor: ColorCallback;
    UserNameColor: ColorCallback;
    UserLinkColor: ColorCallback;
    AnswerColor: ColorCallback;
    InputColor: ColorCallback;
}
