import {SlashCommandBuilder, SlashCommandSubcommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";

export interface BaseCommand {
	command: SlashCommandBuilder | SlashCommandSubcommandBuilder;
	callback: (interaction: CommandInteraction) => any | Promise<any>;
	check?: (interaction: CommandInteraction, defaultCheck: (interaction: CommandInteraction) => boolean | Promise<boolean>) => boolean | Promise<boolean>;
}

export interface Command extends BaseCommand {
	command: SlashCommandBuilder;
}

export interface Subcommand extends BaseCommand {
	command: SlashCommandSubcommandBuilder;
}

export interface BaseSubcommandGroup {
	name: string;
	description: string;
	commands?: Subcommand[];
	check?: (interaction: CommandInteraction, defaultCheck: (interaction: CommandInteraction) => boolean | Promise<boolean>) => boolean | Promise<boolean>;
}

export interface SubcommandGroup extends BaseSubcommandGroup {
	commands: Subcommand[];
}

export interface Subcommands extends BaseSubcommandGroup {
	groups?: SubcommandGroup[];
}