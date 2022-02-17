import { CommandInteraction } from "discord.js";
import HaikuClient from "../client";

export class HaikuCommandInteraction extends CommandInteraction {
    declare public client: HaikuClient;

    constructor(client: HaikuClient, data) {
        super(client, data);
        this.client = client;
    }
}