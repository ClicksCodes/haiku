import {
	Embed,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import chalk from "chalk";
import { Routes } from "discord-api-types/v9";
import { Client, ClientOptions, Collection, CommandInteraction, Interaction, User } from "discord.js";
import cron from "node-cron";
import * as SENRYU from "./commands/senryu.js";
import { HaikuConfig } from "./interfaces/HaikuConfig";
import {BaseCommand, Command, Subcommand, SubcommandGroup, Subcommands} from "./interfaces/Commands";
import fs from "fs";
import getCaller from "./utils/getCaller.js";
import * as path from "path";

const { schedule } = cron;

interface _Command extends BaseCommand {
	check: (interaction: CommandInteraction) => boolean | Promise<boolean>;
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
	commands: Collection<string, _Command>;

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
		let defaultConfig = {
			token: "",
			dev: false,
			owners: [],
			devtoken: "",
			devguild: "",
			activities: [],
			defaultCheck: () => true,
			//defaultCommands: []
		};
		Object.assign(superOptions, ClientOptions);
		Object.assign(defaultConfig, config);
		super(superOptions);
		this.ready = false;
		this.commands = new Collection();
		this.tasksToRun = [];

		this.config = defaultConfig;

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

			const command = this.commands.get(interaction.commandName);
			if (!command) return;

			const sendErrorMessage = async (message: string) => {
				let method = (!interaction.deferred && !interaction.replied) ? interaction.reply.bind(interaction) : interaction.followUp.bind(interaction);
				await method({
					embeds: [
						new Embed()
							.setColor(0xff0000)
							.setTitle("I couldn't run that command")
							.setDescription(message)
					]
				, ephemeral: true});
			}

			try {
				let hasPermission = await command.check(interaction);

				if (!hasPermission) {
					return await sendErrorMessage("You don't have permission to run this command");
				}
			} catch (error) {
				return await sendErrorMessage(`It doesn't look like you can run that command right now: ${error}`);
			}

			try {
				await command.callback(interaction);
			} catch (error) {
				this._error(error);
				await sendErrorMessage(`There was an error while executing this command!: ${error}`);
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

	/**
	 * @param commandPath The path to the folder containing the commands
	 */
	async registerCommandsIn(commandPath: string) {
		if (!commandPath.startsWith("/")) commandPath = `${path.dirname(getCaller())}/${commandPath}`;
		commandPath = path.normalize(commandPath);
		try {
			const commandFiles = fs.readdirSync(commandPath, {withFileTypes: true}).filter(
				file => file.name.endsWith('.js')
					|| file.name.endsWith('.mjs')
					|| file.name.endsWith('.cjs')
					|| file.isDirectory());
			for (const topLevelFile of commandFiles) {
				if (topLevelFile.isDirectory()) {
					let command = {} as Subcommands;
					// Import all subcommands in the directory
					const subFiles = fs.readdirSync(`${commandPath}/${topLevelFile.name}`, {withFileTypes: true}).filter(
						file => file.name.endsWith('.js')
							|| file.name.endsWith('.mjs')
							|| file.name.endsWith('.cjs')
							|| file.isDirectory());

					let level1Subcommands: Subcommand[] = [];
					let subcommandGroups: SubcommandGroup[] = [];

					for (const subFile of subFiles) {
						if (subFile.isDirectory()) {
							// Import all subcommands in the directory
							const subSubFiles = fs.readdirSync(`${commandPath}/${topLevelFile.name}/${subFile.name}`, {withFileTypes: true}).filter(
								file => file.name.endsWith('.js')
									|| file.name.endsWith('.mjs')
									|| file.name.endsWith('.cjs'));

							let level2Subcommands: Subcommand[] = [];

							for (const subSubFile of subSubFiles) {
								const commandData = await import(`${commandPath}/${topLevelFile.name}/${subFile.name}/${subSubFile.name}`) as {
									command: SlashCommandSubcommandBuilder,
									default?: (interaction: CommandInteraction) => any | Promise<any>,
									callback?: (interaction: CommandInteraction) => any | Promise<any>,
									check?: (interaction: CommandInteraction, defaultCheck: (interaction: CommandInteraction) => boolean | Promise<boolean>) => boolean | Promise<boolean>
								};
								level2Subcommands.push({
									command: commandData.command,
									callback: commandData.callback || commandData.default,
									check: commandData.check,
								});
							}

							let group = {
								commands: level2Subcommands,
							} as SubcommandGroup;

							try {
								const meta = await import(`${commandPath}/${topLevelFile.name}/${subFile.name}/meta.json`, {assert: {type: "json"}}) as { name: string, description: string, defaultPermission: boolean };
								group.name = (meta.name ?? subFile.name).toLowerCase();
								group.description = meta.description ?? "No description";
								// group.defaultPermission = (meta.defaultPermission ?? true); // TODO: Implement default permissions
							} catch (e) {
								this._warn(`"No meta.json found for command group ${commandPath}/${topLevelFile.name}/${subFile.name}/ or reading meta.json failed: ${e}`);
								group.name = subFile.name.toLowerCase();
								group.description = "No description";
							}

							subcommandGroups.push(group);

							continue;
						}

						const commandData = await import(`${commandPath}/${topLevelFile.name}/${subFile.name}`) as {
							command: SlashCommandSubcommandBuilder,
							default?: (interaction: CommandInteraction) => any | Promise<any>,
							callback?: (interaction: CommandInteraction) => any | Promise<any>,
							check?: (interaction: CommandInteraction, defaultCheck: (interaction: CommandInteraction) => boolean | Promise<boolean>) => boolean | Promise<boolean>
						};

						let subcommand = {
							command: commandData.command,
							callback: commandData.callback || commandData.default,
							check: commandData.check,
						} as Subcommand;

						level1Subcommands.push(subcommand);
					}

					try {
						const meta = await import(`${commandPath}/${topLevelFile.name}/meta.json`, {assert: {type: "json"}}) as { name: string, description: string, defaultPermission: boolean };
						command.name = (meta.name ?? topLevelFile.name).toLowerCase();
						command.description = meta.description ?? "No description";
						// command.defaultPermission = (meta.defaultPermission ?? true); // TODO: Implement default permissions
					} catch (e) {
						this._warn(`"No meta.json found for command group ${commandPath}/${topLevelFile.name}/ or reading meta.json failed: ${e}`);
						command.name = topLevelFile.name.toLowerCase();
						command.description = "No description";
					}

					command.commands = level1Subcommands;
					command.groups = subcommandGroups;
					// TODO: Implement checks (possibly changing meta.json to _meta.js or similar?)

					this.registerCommand(command);
					this._log(`Registered command group ${commandPath}/${topLevelFile.name} (/${command.name})`);

					continue;
				}

				const commandData = await import(`${commandPath}/${topLevelFile.name}`) as {
					command: SlashCommandBuilder,
					default?: (interaction: CommandInteraction) => any | Promise<any>,
					callback?: (interaction: CommandInteraction) => any | Promise<any>,
					check?: (interaction: CommandInteraction, defaultCheck: (interaction: CommandInteraction) => boolean | Promise<boolean>) => boolean | Promise<boolean>
				};

				let command = {
					command: commandData.command,
					callback: commandData.callback || commandData.default,
					check: commandData.check,
				} as Command;

				this.registerCommand(command);
			}
		} catch (e) {
			this._error(`Unable to load commands from ${commandPath}`);
			this._error(e);
		}
	}

	/**
	 * @param command The command to register
	 *
	 * @returns The bot instance for chaining
	 */
	registerCommand(command: Command | Subcommands) {
		let registered: SlashCommandBuilder;
		if (command.hasOwnProperty("command")) {
			// It's just a normal command
			command = command as Command;
			registered = command.command;
			this.commands.set(command.command.name, {command: command.command, callback: command.callback, check:
					(interaction => {
						if (command.check) return command.check(interaction, this.config.defaultCheck);
						return this.config.defaultCheck(interaction);
					})
			});
		} else {
			// It's a top-level subcommand
			command = command as Subcommands;
			registered = new SlashCommandBuilder().setName(command.name).setDescription(command.description);
			let defaultCheck = (interaction => {
				if (command.check) return command.check(interaction, this.config.defaultCheck);
				return this.config.defaultCheck(interaction);
			});
			if (command.commands !== undefined) for (let subcommand of command.commands) {
				this.commands.set(command.name + " " + subcommand.command.name, {command: subcommand.command, callback: subcommand.callback, check: (interaction => {
						if (subcommand.check) return subcommand.check(interaction, defaultCheck);
						return defaultCheck(interaction);
					})
				});
				registered.addSubcommand(subcommand.command);
				// FIXME: Getting 'Expected to receive a b builder, got b instead.' when running with DN Poster (i.e. just normal subcommands). I'm pretty sure that the builders I'm providing are actually builders too
			}
			if (command.groups !== undefined) for (let group of command.groups) {
				let registeredGroup = new SlashCommandSubcommandGroupBuilder().setName(group.name).setDescription(group.description);
				let defaultGroupCheck = (interaction => {
					if (group.check) return group.check(interaction, defaultCheck);
					return defaultCheck(interaction);
				});
				if (command.commands !== undefined) for (let subcommand of command.commands) {
					registeredGroup.addSubcommand(subcommand.command);
					this.commands.set(command.name + " " + group.name + " " + subcommand.command.name, {command: subcommand.command, callback: subcommand.callback, check: (interaction => {
							if (subcommand.check) return subcommand.check(interaction, defaultGroupCheck);
							return defaultGroupCheck(interaction);
						})
					});
				}
				registered.addSubcommandGroup(registeredGroup);
			}
		}

		this._HTTPRegisterCommands(registered).then();

		return this;
	}

	async _HTTPRegisterCommands(command: SlashCommandBuilder | SlashCommandBuilder[]) {
		try {
			let commands = Array.isArray(command) ? command.map(c => c.toJSON()) : [command.toJSON()];

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