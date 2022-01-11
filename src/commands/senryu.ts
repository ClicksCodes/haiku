import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, UserResolvable } from "discord.js";
import HaikuClient from "../client";


export class Senryu {
    public client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    //TODO: Make this work like jsk py
    async js(interaction: CommandInteraction) {
        return "";
    }

    //TODO: Make this work like jsk sh
    async shell(interaction: CommandInteraction) {
        return "";
    }


    async su(interaction:CommandInteraction, user: UserResolvable, command: string) {
        let u = this.client.users.fetch(user)
        return "";
    }

}

export const data = new SlashCommandBuilder()
    .setName("senryu")
    .setDescription("Bot Utilities")
    .setDefaultPermission(false)
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
            .setName("js")
            .setDescription("Runs a javascript codeblock")
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
            .setName("shell")
            .setDescription("Runs a shell command")
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
            .setName("su")
            .setDescription("Runs a command as another user")
            .addUserOption(option => option.setName('target').setDescription('Select a user'))
            .addStringOption(option => option.setName('command').setDescription('The command to run'))
    )

export const execute = async (interaction: CommandInteraction) => {
    const senryu = new Senryu(interaction.client);
    
    switch(interaction.options.getSubcommand()) {
        case "js":
            await senryu.js(interaction);
            break;
        case "shell":
            await senryu.shell(interaction);
            break;
        case "su":
            let suAs = interaction.options.getUser('target');
            let suCommand = interaction.options.getString('command');
            //desperately need to extend CommandInteraction to use HaikuClient instead of Client
            if(!interaction.client.commands.includes(suCommand)) return interaction.followUp({ content: 'Command not found', ephemeral: true });
            await senryu.su(interaction, suAs, suCommand);
            break;
        default:
            interaction.reply("Invalid subcommand");
            break;
    }
    
}
