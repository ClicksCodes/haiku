import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import chalk from "chalk";
import { Routes } from "discord-api-types/v9";
import { Client, ClientOptions, Collection, CommandInteraction, Interaction, User } from "discord.js";
import cron from "node-cron";
import * as SENRYU from "./commands/senryu.js";
import { HaikuConfig } from "./interfaces/HaikuConfig";

const { schedule } = cron;

export interface Command {
	command: SlashCommandBuilder;
	callback: (interaction: CommandInteraction) => any | Promise<any>;
	check?: (interaction: CommandInteraction) => boolean | Promise<boolean>;
}

export interface Subcommand implements Command {
	command: SlashCommandSubcommandBuilder;
	check?: (interaction: CommandInteraction, check: (interaction: CommandInteraction) => Promise<boolean>) => boolean | Promise<boolean>;
}

export interface SubcommandGroup {
	name: string;
	description: string;
	commands?: Subcommand[];
	check?: (interaction: CommandInteraction) => boolean | Promise<boolean>;
}

export interface Subcommands implements SubcommandGroup {
	groups?: SubcommandGroup[] & !Subcommands;
}




/**
 * @class HaikuClient
 * @extends Client
 * @description This class is for the client
 * @author ClicksMinutePer
 */
export class HaikuClient extends Client {
	config: HaikuConfig;
	senryu: SENRYU.Senryu;
	ready: boolean;
	tasksToRun: cron.ScheduledTask[];
	commands: Collection<string, Command>;

	/**
	 * @param ClientOptions options
	 * @param config
	 */
	constructor(ClientOptions?: ClientOptions, config?: HaikuConfig) {
		let superOptions = {
			shards: "auto",
			allowedMentions: {
				repliedUser: false,
				roles: [],
				users: []
			},
			invalidRequestWarningInterval: 50,
			partials: [],
			restWsBridgeTimeout: 5_000,
			restTimeOffset: 500,
			restRequestTimeout: 15_000,
			restSweepInterval: 60,
			restGlobalRateLimit: 50,
			rejectOnRateLimit: [],
			retryLimit: 1,
			failIfNotExists: true,
			userAgentSuffix: ["Using Haiku by ClicksMinutePer", "Using Discord.js"],
			presence: {},
			intents: [],
			waitGuildTimeout: 15_000,
			sweepers: {},
			ws: {
				large_threshold: 50
			},
			http: {
				version: 9,
				agent: {},
				api: 'https://discord.com/api',
				cdn: "https://cdn.discordapp.com",
				invite: "https://discord.gg",
				template: "https://discord.new",
				headers: {},
				scheduledEvent: "https://discord.com/events"
			}
		} as ClientOptions;
		Object.assign(superOptions, ClientOptions);
		super(superOptions);
		this.ready = false;
		this.commands = new Collection();
		this.tasksToRun = [];

		if (config) {
			if (!config.dev) config.dev = false;
			this.config = config;
		} else {
			this._notice("No config provided, using default config");
			this.config = {
				token: "",
				dev: false,
				owners: [],
				devtoken: "",
				devguild: "",
				activities: [],
				//defaultCommands: []
			}
		}
		// if(this.config.defaultCommands.includes("SENRYU")){
		// 	this.registerCommand(SENRYU.data, SENRYU.execute);
		// 	this.senryu = new SENRYU.Senryu(this);
		// }

		this.once("ready", async () => {
			try {
				await this.application.fetch();
				this.config.owners ??= this.application.owner instanceof User ? [this.application.owner.id] : this.application.owner.members.map(owner => owner.id);
			} catch (e) {
				this._error(e);
			}

			this.ready = true;
			await this._HTTPRegisterCommands();

			this.emit("hydrated");

			this._log("-- Haiku Client Ready --");
			this._log(`Logged in as ${this.user.tag}`);
			this._log(`Serving ${this.guilds.cache.size} guilds`);
			this._log(`-- Here we go! --`);
			this.tasksToRun.forEach(task => task.start());
			this.tasksToRun = [];
		});

		this.on("ready", async () => {
			this._log("Client connected to discord")
		});

		this.on("interactionCreate", async (interaction) => {
			if (!this.ready) return;
			if (!interaction.isCommand()) return;

			if (this.config.restrictToOwner && !this.isOwner(interaction.user.id)) {
				this._log(`${interaction.user.tag} tried to use a command but is not an owner`);
				return await interaction.reply({
					embeds: [
						{
							title: "You are not an owner",
							description: "This bot is in restricted mode and you are not an owner of this bot. If you believe this is an error, please contact the bot owner.",
							color: 0xFF0000
						}
					],
					ephemeral: true
				});
			}

			const command = this.commands.get(interaction.commandName);

			if (!command) return;

			try {
				await command.default(interaction);
			} catch (error) {
				this._error(error);
				let method = (!interaction.deferred && !interaction.replied) ? interaction.reply.bind(interaction) : interaction.followUp.bind(interaction);
				await method({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		});
	}

	_notice(message: string) {
		this._log(chalk.blueBright(message));
	}

	_log(message: string) {
		console.log(`[HaikuClient @ ${new Date().toLocaleString()}] : ${message}`);
	}

	_warn(message: string) {
		this._log(chalk.yellow(message));
	}

	_error(message: Error | string) {
		if (message instanceof Error) {
			let stack = message.stack.split("\n");
			for (let line of stack) {
				this._log(chalk.redBright(line));
			}
		} else {
			this._log(chalk.redBright(message));
		}
	}

	isOwner(id: string): boolean {
		return this.config.owners.includes(id);
	}


	/**
	 * @param command The Slash Command to add
	 * @param callback The callback to execute when the command is called
	 */
	registerCommand(options: Command | Subcommands & !Subcommand) {
		if (options.hasOwnProperty("command")) {
			// It's just a normal command
			options = options as Command;
			this.commands.set(options.command.name, {command: options.command, default: options.callback, check: options.check});
		}

		
		// this.commands.set(command.name, {command, default: callback});

		// if (this.ready) {
		// 	this._HTTPRegisterCommands(command).then();
		// }
		return this;
	}

	async waitForReady() {
		await new Promise(resolve => {
			if (this.ready) resolve(this);
			else this.once("ready", resolve);
		});
	}

	async waitForEvent({ event, check = (..._) => true, timeout = null }: { event: string, check: (...eventData) => boolean, timeout?: number }): Promise<any> {
		return await new Promise((resolve, reject) => {
			const tryToResolve = (...eventData) => {
				if (check(...eventData)) {
					this.off(event, tryToResolve);
					resolve(eventData);
				}
			}

			if (timeout) setTimeout(() => {
				this.off(event, tryToResolve);
				reject(`Timeout while waiting for ${event}`)
			}, timeout);

			this.on(event, tryToResolve);
		});
	}

	async _HTTPRegisterCommands(command?: SlashCommandBuilder) {
		try {
			let commands = command === undefined ? this.commands.map(c => c.command.toJSON()) : [command.toJSON()];

			this._log(`Registering ${commands.length} command${commands.length !== 1 ? "s" : ""}`);
			await this.waitForReady();

			const rest = new REST({ version: '9' }).setToken(this.token);

			await rest.put(
				this.config.dev ? Routes.applicationGuildCommands(this.user.id, this.config.devguild) : Routes.applicationCommands(this.user.id),
				{ body: commands }
			);
			this._log('Successfully registered all commands');
		} catch (err) {
			this._error(`Failure while registering commands`)
			this._error(err);
		}
	}

	registerEvent(event: string, callback: (client: HaikuClient, ...eventData) => Promise<any>): HaikuClient {
		if (event === undefined || callback === undefined) return this;

		this.on(event, async (...eventData) => {
			try {
				await callback(this, ...eventData);
			} catch (error) {
				this._error(error);
			}
		});
		return this;
	}

	/**
	 * @param time The time to run the task at, either null to run immediately on bot startup or a cron string
	 * @param callback The callback to execute when the command is called
	 */
	registerTask(time: string | null | undefined, callback: (client: HaikuClient) => Promise<any>): HaikuClient {
		if (callback == undefined) return this;

		if (time === null || time === undefined) {
			callback(this).then().catch(this._error.bind(this));
		} else {
			let task = schedule(time, async () => {
				this._log(`Running scheduled task (${time})`);
				try {
					await callback(this);
				} catch (error) {
					this._error(error);
				}
			}, { scheduled: this.ready, timezone: "UTC" });

			if (!this.ready) this.tasksToRun.push(task);
		}

		return this;
	}

	/**
	 * @param token The token to use to login
	 * @description If no token is provided, it will attempt to use the tokens in the config
	 */
	login(token?: string): Promise<string> {
		if (!token) {
			this._warn("No token provided, trying config tokens instead");
			if (this.config.dev) {
				token = this.config.devtoken;
				if (!token) {
					this._error("Dev token not provided")
					return process.exit(1);
				}
			} else {
				token = this.config.token;
				if (!token) {
					this._error("Main token not provided")
					this._notice("Attempting log in with dev token");
					token = this.config.devtoken;
					if (!token) throw new Error("No tokens provided");
				}
			}
		}

		return super.login(token);
	}

}

export default HaikuClient;