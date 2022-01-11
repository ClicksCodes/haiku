import { Client, Collection } from "discord.js";
import chalk from "chalk";
import * as SENRYU from "./commands/senryu";
/**
 * @class HaikuClient
 * @extends Client
 * @description This class is for the client
 * @author ClicksMinutePer
 */
class HaikuClient extends Client {
    /**
     * @param ClientOptions options
     */
    constructor(ClientOptions, config) {
        super(ClientOptions);
        this.ready = false;
        this.ownerFilter = (id) => this.config.owners.includes(id);
        this.commands = new Collection();
        if (config) {
            if (!config.dev)
                config.dev = false;
            this.config = config;
        }
        else {
            this._notice("No config provided, using default config");
            this.config = {
                token: "",
                dev: false,
                owners: [],
                devtoken: "",
                devguild: "",
                activities: [],
                defaultCommands: []
            };
        }
        if (this.config.defaultCommands.includes("SENRYU"))
            this.registerCommand(SENRYU.data, SENRYU.execute);
        this.on("ready", () => {
            this.ready = true;
            this._log("-- Haiku Client Ready --");
            this._log(`Logged in as ${this.user.tag}`);
            this._log(`Serving ${this.guilds.cache.size} guilds`);
            this._log(`-- Here we go! --`);
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
                this._error(error);
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
    }
    _notice(message) {
        this._log(chalk.blueBright(message));
    }
    _log(message) {
        console.log(`[HaikuClient @ ${new Date().toLocaleString()}] : ${message}`);
    }
    _warn(message) {
        this._log(chalk.yellow(message));
    }
    _error(message) {
        this._log(chalk.redBright(message));
    }
    /**
     * @param command The Slash Command to add
     */
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
                this._error(error);
            }
        });
        return this;
    }
    /**
     * @param token The token to use to login
     * @description If no token is provided, it will attempt to use the tokens in the config
     */
    login(token) {
        if (!token) {
            this._warn("No token provided, trying config tokens instead");
            if (this.config.dev) {
                token = this.config.devtoken;
                if (!token) {
                    this._error("Dev token not provided");
                    return process.exit(1);
                }
            }
            else {
                token = this.config.token;
                if (!token) {
                    this._error("Main token not provided");
                    this._notice("Attempting log in with dev token");
                    token = this.config.devtoken;
                    if (!token)
                        throw new Error("No tokens provided");
                }
            }
        }
        return super.login(token);
    }
}
export default HaikuClient;
