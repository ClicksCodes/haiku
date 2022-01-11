import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
export class Senryu {
    constructor(client) {
        this.client = client;
    }
    //TODO: Make this work like jsk py
    async js(interaction) {
        return;
    }
    //TODO: Make this work like jsk sh
    async shell(interaction) {
        return;
    }
    async su(interaction, user, command) {
        let u = await this.client.users.fetch(user);
        let cmd = this.client.commands.get(command);
        interaction.user = u;
        interaction.member = await interaction.guild.members.fetch(user);
        interaction.memberPermissions = interaction.member.permissions;
        cmd.default(interaction);
        return;
    }
}
export const data = new SlashCommandBuilder()
    .setName("senryu")
    .setDescription("Bot Utilities")
    .setDefaultPermission(false)
    .addSubcommand(new SlashCommandSubcommandBuilder()
    .setName("js")
    .setDescription("Runs a javascript codeblock"))
    .addSubcommand(new SlashCommandSubcommandBuilder()
    .setName("shell")
    .setDescription("Runs a shell command"))
    .addSubcommand(new SlashCommandSubcommandBuilder()
    .setName("su")
    .setDescription("Runs a command as another user")
    .addUserOption(option => option.setName('target').setDescription('Select a user'))
    .addStringOption(option => option.setName('command').setDescription('The command to run')));
export const execute = async (interaction) => {
    const senryu = new Senryu(interaction.client);
    switch (interaction.options.getSubcommand()) {
        case "js":
            await senryu.js(interaction);
            break;
        case "shell":
            await senryu.shell(interaction);
            break;
        case "su":
            let suAs = interaction.options.getUser('target');
            let suCommand = interaction.options.getString('command');
            //desperately need to extend HaikuCommandInteraction to use HaikuClient instead of Client
            if (!interaction.client.commands.has(suCommand))
                return interaction.followUp({ content: 'Command not found', ephemeral: true });
            await senryu.su(interaction, suAs, suCommand);
            break;
        default:
            interaction.reply("Invalid subcommand");
            break;
    }
};
