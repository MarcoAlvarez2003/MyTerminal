import { MemoryStorage } from "./mstore.ts";
import { Router } from "./router.ts";

interface ConfigKeys {
    username: string;
    password: string;
    language: string;
    [key: string]: unknown;
}

class StatusController {
    constructor(
        protected storage: MemoryStorage,
        protected router: Router,
        protected keys: ConfigKeys
    ) {}

    public async go(path: string) {
        await this.router.to(path);
    }

    public goBack() {
        this.router.back();
    }

    public goHome() {
        this.router.home();
    }

    public getLastFolder() {
        return this.router.getLastFolder();
    }

    public getPathLink() {
        return this.router.getPathLink();
    }

    public getRootLink() {
        return this.router.getRootLink();
    }

    public getUserDisk() {
        return this.router.getUserDisk();
    }

    public getUserName() {
        if (!this.storage.has(this.keys.username)) {
            this.storage.set(this.keys.username, this.router.getUserName());
        }

        return this.storage.get(this.keys.username) as string;
    }

    public getUserLang() {
        if (!this.storage.has(this.keys.language)) {
            this.storage.set(this.keys.language, "en");
        }

        return this.storage.get(this.keys.language) as string;
    }

    public getUserPass() {
        if (!this.storage.has(this.keys.password)) {
            this.storage.set(this.keys.password, "");
        }

        return this.storage.get(this.keys.password) as string;
    }

    public changeUserName(newName: string) {
        this.storage.set(this.keys.username, newName);
    }

    public changeUserPass(newPass: string) {
        this.storage.set(this.keys.password, newPass);
    }

    public changeUserLang(newLang: string) {
        this.storage.set(this.keys.language, newLang);
    }
}

export { StatusController };
