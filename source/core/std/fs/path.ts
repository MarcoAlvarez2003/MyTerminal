import { join } from "../../../imports/path.ts";
import { exist } from "../../../utils/path.ts";

class NotAllowed extends Error {
  public name: string = "NotAllowed";

  constructor(public path: string) {
    super(`Unable to access location ${path}`);
  }
}

class NotFound extends Error {
  public name: string = "NotFound";

  constructor(public folder: string) {
    super(`The folder ${folder} does not exist`);
  }
}

class Path {
  public root: string[] = [];
  public path: string[] = [];
  public user: string = "";
  public disk: string = "";

  constructor(public link: string) {
    this.update();
  }

  public async to(folder: string) {
    const path = join(this.link, folder);

    if (!(await exist(path))) {
      throw new NotFound(folder);
    }

    if (!this.path.length) {
      throw new NotAllowed(path);
    }

    this.link = path;
    this.update();
  }

  public update() {
    const folders = this.link.replace(/\\/g, "/").split("/");

    if (Deno.build.os === "windows") {
      const [disk, _, user, ...path] = folders;

      this.root = [disk, _, user];
      this.path = path;
      this.user = user;
      this.disk = disk;
    }

    if (Deno.build.os === "linux") {
      const [_, disk, user, ...path] = folders;

      this.root = [disk, user];
      this.path = path;
      this.user = user;
      this.disk = disk;
    }
  }
}

export { Path, NotAllowed, NotFound };
