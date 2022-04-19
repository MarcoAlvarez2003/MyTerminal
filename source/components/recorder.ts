export class Recorder {
    constructor(protected storage: string[] = []) {}

    public record(...datas: any[]) {
        this.storage.push(datas.map((data) => (data ? data.toString() : "")).join());

        return this;
    }

    public print() {
        console.log(this.getAsText());

        return this;
    }

    public clear() {
        this.storage.length = 0;

        return this;
    }

    public get() {
        return this.storage;
    }

    public getAsText() {
        return this.get().join("\n");
    }

    public log(...data: any[]) {
        const output = this.clear()
            .record(...data)
            .print()
            .getAsText();

        this.clear();
        return output;
    }
}
