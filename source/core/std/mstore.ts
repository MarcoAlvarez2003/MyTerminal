import { exist } from "../../utils/path.ts";

class MemoryStorage {
  constructor(protected path: string, protected storage: Record<string, unknown> = {}) {}

  public async load() {
    if (await exist(this.path)) {
      this.storage = JSON.parse(await Deno.readTextFile(this.path));
    } else {
      await this.save();
    }

    return this;
  }

  public async save() {
    await Deno.writeTextFile(this.path, JSON.stringify(this.storage));

    return this;
  }

  public get(key: string) {
    return this.storage[key];
  }

  public del(key: string) {
    delete this.storage[key];
  }

  public has(key: string) {
    return key in this.storage;
  }

  public set(key: string, value: unknown) {
    this.storage[key] = value;
  }

  *[Symbol.iterator](): Generator<[string, unknown]> {
    for (const key in this.storage) {
      yield [key, this.storage[key]];
    }
  }
}

export { MemoryStorage };
