import { Path, NotAllowed, NotFound } from "./path.ts";
import { join } from "../imports/path.ts";

class Router {
    constructor(protected path: Path) {}

    public async to(...folders: string[]) {
        for (const folder of folders) {
            await this.path.to(folder);
        }
    }

    public back() {
        this.path.link = join(this.path.link, "..");
        this.path.update();
    }

    public home() {
        this.path.link = Deno.cwd();
        this.path.update();
    }

    public getLastFolder() {
        return this.path.path.slice(-1)[0];
    }

    public getUserName() {
        return this.path.user;
    }

    public getUserDisk() {
        return this.path.disk;
    }

    public getUserLink() {
        return this.path.link;
    }

    public getRootLink() {
        return this.path.root.join("\\");
    }

    public getPathLink() {
        return this.path.path.join("\\");
    }
}

export { Router };
