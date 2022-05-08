import { MemoryStorage } from "../../core/std/utils/mstore.ts";

export interface Theme {
  ShellColors: ShellColors;
  Colors: Colors;
}

export interface ShellColors {
  lastFolder: ThemeFn;
  link: ThemeFn;
  name: ThemeFn;
}

export interface Colors {
  answer: ThemeFn;
  input: ThemeFn;
}

export interface ThemeFn {
  (text: string): string;
}

export const identifier = "system.current.color";

export function getCurrentTheme(themes: Record<string, Theme>, memory: MemoryStorage) {
  const themeName = memory.get(identifier);

  if (typeof themeName === "string") {
    return themes[themeName];
  }

  memory.set(identifier, "default");
  return themes.default;
}
