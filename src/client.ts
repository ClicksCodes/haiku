import {Client, Collection, Interaction, ClientOptions} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import { HaikuConfig } from "./interfaces/HaikuConfig";
import chalk from "chalk";

/**
 * @class HaikuClient
 * @extends Client
 * @description This class is for the client
 * @author ClicksMinutePer
 */
class HaikuClient extends Client {
	commands: Collection<string, {command: SlashCommandBuilder, default: (interaction: Interaction) => Promise<any>}>;
	ready = false;
	ownerFilter = (id: string) => this.config.owners.includes(id);
	private config: HaikuConfig;

	/**
	 * @param ClientOptions options
	 */
	constructor(ClientOptions?: ClientOptions, config?: HaikuConfig) {
		super(ClientOptions);
		this.commands = new Collection();

		if (config) {
			if(!config.dev) config.dev = false;
			this.config = config;	
		} else {
			this.config = {
				token: "",
				dev: false
			}
		}
		
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

	_notice(message: string) {
		this._log(chalk.blue(message));
	}

	_log(message: string) {
		console.log(`[HaikuClient @ ${new Date().toLocaleString()}] : ${message}`);
	}

	_warn(message: string) {
		this._log(chalk.yellow(message));
	}

	_error(message: string) {
		this._log(chalk.redBright(message));
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
		if (!token) {
			this._warn("No token provided, trying config tokens instead");
			if(this.config.dev) {
				token = this.config.devtoken;
				if(!token) this._error("Dev token not provided")
			} else {
				token = this.config.token;
				if(!token) {
					this._error("Main token not provided")
					this._notice("Attempting log in with dev token");
					token = this.config.devtoken;
					if(!token) throw new Error("No tokens provided");
				}
			}
		}
		return super.login(token);
	}

}

export default HaikuClient;