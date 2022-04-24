import { MemoryStorage } from "../../../components/mstore.ts";
import { Default } from "./themes.ts";
import { Theme } from "./type.ts";

export const ColorIdentifier = "current.system.color";

export function getCurrentTheme(themes: Record<string, Theme>, memory: MemoryStorage) {
    const currentColor = memory.get(ColorIdentifier);

    if (typeof currentColor === "string") {
        return themes[currentColor];
    }

    memory.set(ColorIdentifier, "Default");
    return Default;
}
