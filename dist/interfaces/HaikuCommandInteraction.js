import { CommandInteraction } from "discord.js";
export class HaikuCommandInteraction extends CommandInteraction {
    constructor(client, data) {
        super(client, data);
        this.client = client;
    }
}
