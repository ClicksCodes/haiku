import {Client, Collection, Interaction, ClientOptions} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import { HaikuConfig } from "./interfaces/HaikuConfig";

/**
 * @class HaikuClient
 * @extends Client
 * @description This class is for the client
 * @author ClicksMinutePer
 */
class HaikuClient extends Client {
	commands: Collection<string, {command: SlashCommandBuilder, default: (interaction: Interaction) => Promise<any>}>;
	ready = false;
	private config: HaikuConfig;

	/**
	 * @param ClientOptions options
	 */
	constructor(ClientOptions?: ClientOptions, config?: HaikuConfig) {
		super(ClientOptions);
		this.commands = new Collection();

		this.config = config;

		this.on("ready", () => {
			this.ready = true;
			this._log("-- Haiku Client Ready --");
			this._log(`Logged in as ${this.user.tag}`);
			this._log(`${this.guilds.cache.size} guilds`);
			this._log(`-- Here we go! --`);
		});

		this.on("interactionCreate", async (interaction) => {
			if(!interaction.isCommand()) return;

			const command = this.commands.get(interaction.commandName);

			if (!command) return;

			try {
				await command.default(interaction);
			} catch (error) {
				console.error(error);
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		});
	}

	_log(message: string) {
		console.log(`[HaikuClient @ ${new Date().toLocaleString()}] : ${message}`);
	}

	_error(message: string) {
		console.error(`[HaikuClient @ ${new Date().toLocaleString()}] : ${message}`);
	}

	/**
	 * @param command The Slash Command to add
	 */
	registerCommand(command: SlashCommandBuilder, callback: (interaction: Interaction) => Promise<any>) : HaikuClient {
		if (command == undefined || callback == undefined) return this;

		this.commands.set(command.name, {command, default: callback});
		return this;
	}

	registerEvent(event: string, callback: (client: HaikuClient, ...eventData) => Promise<any>) : HaikuClient {
		if (event == undefined || callback == undefined) return this;

		this.on(event, async (...eventData) => {
			try {
				await callback(this, ...eventData);
			} catch (error) {
				this._error(error);
			}
		});
		return this;
	}

	login(token?: string): Promise<string> {
		if (token == undefined) token = this.config.dev ? this.config.devtoken : this.config.token;
		if(!token) throw new Error("No token provided!");
		return super.login(token);
	}

}

export default HaikuClient;