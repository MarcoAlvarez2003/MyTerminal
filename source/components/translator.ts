import { StatusController } from "./status.ts";
import { MemoryStorage } from "./mstore.ts";

class TranslationNotAvailable extends Error {
    constructor(lang: string) {
        super(`There is no translation available for the current language [${lang}]`);

        this.name = "TranslationNotAvailable";
    }
}

class Translator {
    protected translations: Record<string, Record<string, Record<string, string>>> = {};

    constructor(protected memory: MemoryStorage, protected status: StatusController) {}

    public set(name: string, translations: Record<string, Record<string, string>>) {
        this.translations[name] = translations;

        this.save();
    }

    public get(name: string, lang: string = this.status.getUserLang()) {
        const translation = this.translations[name][lang];

        return {
            get(key: string) {
                try {
                    return translation[key];
                } catch (e) {
                    if (e instanceof TypeError) {
                        throw new TranslationNotAvailable(lang);
                    }
                }
            },
        };
    }

    public all(name: string) {
        return this.translations[name];
    }

    public has(name: string, lang: string = this.status.getUserLang()) {
        return !!this.translations[name][lang];
    }

    public update(
        name: string,
        lang: string,
        translations: Record<string, Record<string, string>>
    ) {
        if (this.has(name, lang)) {
            for (const _name in translations) {
                this.translations[name][_name] = translations[_name];
            }

            this.save();
        }
    }

    public save() {
        this.memory.set("translations", this.translations);
    }
}

export { Translator, TranslationNotAvailable };
