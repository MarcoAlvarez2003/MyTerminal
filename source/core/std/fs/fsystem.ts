import { join, basename, extname } from "../../../imports/path.ts";
import { exist } from "../../../utils/path.ts";
import { Path } from "./path.ts";

export interface Stat {
  name: string;
  path: string;
  size: number;
}

export interface Archive extends Stat {
  extension: string;
  content: string;
}

export interface Directory<Data> extends Stat {
  directories: Directory<Data>[];
  files: Data[];
}

class FileSystem {
  constructor(protected path: Path) {}

  public async getStat(name: string): Promise<Stat | undefined> {
    const path = join(this.path.link, name);

    if (await exist(path)) {
      const stat = await Deno.stat(path);

      return {
        name: basename(path),
        size: stat.size,
        path,
      };
    }
  }

  public async getArchive(name: string): Promise<Archive | undefined> {
    const path = join(this.path.link, name);

    if (await exist(path)) {
      const content = await Deno.readTextFile(path);
      const stat = await this.getStat(name);

      if (stat) {
        return {
          extension: extname(path),
          content,
          ...stat,
        };
      }
    }
  }

  public async getDirectory(name: string) {
    const path = join(this.path.link, name);

    if (await exist(path)) {
      const stat = (await this.getStat(name)) as Stat;

      const directory: Directory<Stat> = {
        directories: [],
        files: [],
        ...stat,
      };

      for await (const entry of Deno.readDir(path)) {
        const path = join(name, entry.name);

        if (entry.isDirectory) {
          const data = (await this.getDirectory(path)) as Directory<Stat>;

          directory.directories.push(data);
        } else {
          const data = (await this.getStat(path)) as Stat;

          directory.files.push(data);
        }
      }

      return directory;
    }
  }
}

export { FileSystem };
