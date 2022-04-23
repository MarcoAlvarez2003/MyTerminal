import { ReadLine } from "../../components/readline.ts";
import { Command, SubCommand } from "../../components/handler.ts";
import { Collector } from "./gamelist/collector.ts";

export class Games implements Command {
    public readonly availCommands: SubCommand[] = [];
    public readonly developer: string = "unknown";
    public readonly version: string = "v1.0.0";
    public readonly targets: RegExp = /games/;
    public readonly name: string = "games";

    public async render() {
        const game = await new ReadLine().select("Select game for run:", ["Collector", "Exit"]);

        switch (game) {
            case "Collector":
                await new Collector().start();
                break;

            case "Exit":
                return "";
        }
    }

    public information() {
        console.log(`Experimental command for simple games`);
    }

    public update() {}
}
