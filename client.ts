import {Client, Collection, Interaction} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import {schedule, ScheduledTask} from "node-cron";

class HaikuClient extends Client {
	commands: Collection<string, {command: SlashCommandBuilder, default: (interaction: Interaction) => Promise<any>}>;
	tasksToRun: ScheduledTask[];
	ready = false;

	constructor(ClientOptions) {
		super(ClientOptions);
		this.commands = new Collection();
		this.tasksToRun = [];

		this.on("ready", () => {
			this.ready = true;
			this._log("-- Haiku Client Ready --");
			this._log(`Logged in as ${this.user.tag}`);
			this._log(`${this.guilds.cache.size} guilds`);
			this._log(`-- Here we go! --`);
			this.tasksToRun.forEach(task => task.start());
			this.tasksToRun = [];
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
				console.error(error);
			}
		});
		return this;
	}

	registerTask(time: string | null | undefined, callback: (client: HaikuClient) => Promise<any>) : HaikuClient {
		if (callback == undefined) return this;

		if (time === null || time === undefined) {
			callback(this).then();
		} else {
			let task = schedule(time, async () => {
				this._log(`Running scheduled task (${time})`);
				try {
					await callback(this);
				} catch (error) {
					console.error(error);
				}
			}, {scheduled: this.ready, timezone: "UTC"});

			if (!this.ready) this.tasksToRun.push(task);
		}

		return this;
	}
}

export default HaikuClient;