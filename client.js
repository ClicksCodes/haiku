"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const node_cron_1 = require("node-cron");
class ClicksClient extends discord_js_1.Client {
    constructor(ClientOptions) {
        super(ClientOptions);
        this.ready = false;
        this.commands = new discord_js_1.Collection();
        this.tasksToRun = [];
        this.on("ready", () => {
            this.ready = true;
            this._log("-- Clicks Client Ready --");
            this._log(`Logged in as ${this.user.tag}`);
            this._log(`${this.guilds.cache.size} guilds`);
            this._log(`-- Here we go! --`);
            this.tasksToRun.forEach(task => task.start());
            this.tasksToRun = [];
        });
        this.on("interactionCreate", async (interaction) => {
            if (!interaction.isCommand())
                return;
            const command = this.commands.get(interaction.commandName);
            if (!command)
                return;
            try {
                await command.default(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
    }
    _log(message) {
        console.log(`[ClicksClient @ ${new Date().toLocaleString()}] ${message}`);
    }
    registerCommand(command, callback) {
        if (command == undefined || callback == undefined)
            return this;
        this.commands.set(command.name, { command, default: callback });
        return this;
    }
    registerEvent(event, callback) {
        if (event == undefined || callback == undefined)
            return this;
        this.on(event, async (...eventData) => {
            try {
                await callback(this, ...eventData);
            }
            catch (error) {
                console.error(error);
            }
        });
        return this;
    }
    registerTask(time, callback) {
        if (callback == undefined)
            return this;
        if (time === null || time === undefined) {
            callback(this).then();
        }
        else {
            let task = (0, node_cron_1.schedule)(time, async () => {
                this._log(`Running scheduled task (${time})`);
                try {
                    await callback(this);
                }
                catch (error) {
                    console.error(error);
                }
            }, { scheduled: this.ready, timezone: "UTC" });
            if (!this.ready)
                this.tasksToRun.push(task);
        }
        return this;
    }
}
exports.default = ClicksClient;
//# sourceMappingURL=client.js.map