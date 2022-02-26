import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
import { UserResolvable, Message, Collection, MessageEmbed } from "discord.js";
import HaikuClient from "../client";
import { HaikuCommandInteraction } from "../classes/HaikuCommandInteraction";
import REPL from "repl";
import * as cp from "child_process";
import { HaikuPaginator } from "../index.js";
import { Writable, Readable } from "stream";
import * as os from "os";

interface SenryuShell {
    cp: cp.ChildProcess;
    paginator: HaikuPaginator;
}

export class Senryu {
    public client: HaikuClient;
    private JSShells: Collection<string, [REPL.REPLServer, Readable, Writable]> = new Collection();
    private shells: Collection<string, SenryuShell> = new Collection();

    constructor(client: HaikuClient) {
        this.client = client;
    }

    //TODO: Make this work like jsk py
    async js(interaction: HaikuCommandInteraction) {
        if(!this.JSShells.has(interaction.user.id)) {

            let stdin = new Readable();
            let stdout = new Writable();

            let repl = REPL.start({preview: false, input: stdin, output: stdout, terminal: false, useGlobal: false});

            stdin.push(`console.log('Welcome to the ${interaction.user.username} JS shell!');`);

            this.JSShells.set(interaction.user.id, [repl, stdin, stdout]);
        }
        let repl = this.JSShells.get(interaction.user.id);

        // https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js

    }

    //TODO: Make this work like jsk sh
    async shell(interaction: HaikuCommandInteraction) {
        if(!this.shells.has(interaction.user.id)) {
            this.shells.set(interaction.user.id, {cp: os.platform() === 'win32' ? cp.spawn('cmd') : cp.spawn('bash'), paginator: new HaikuPaginator(new MessageEmbed().setTitle(`${interaction.user.username}'s shell`), {maxDescriptionLength: 2048})});
            // sh -c "The command to run"
            // sh
        }
        let sh = this.shells.get(interaction.user.id);

        interaction.reply({embeds:[new MessageEmbed().setTitle(`${interaction.user.username}'s shell`).setDescription('Loading...')]});

        if(interaction.options.getString("command")) {
            sh.cp.stdin.write(interaction.options.getString("command") + "\n");
        }

        sh.cp.on('data', async (data) => {
            while(sh.cp.stdout.readable) {
                let data = sh.cp.stdout.read();
                if(!data) break;
                sh.paginator.addDescriptionContent(data.toString());
            }
            interaction.editReply({embeds:[sh.paginator.getEmbed()]});
        })

    }


    async su(interaction:HaikuCommandInteraction, user: UserResolvable, command: string) {
        let u = await this.client.users.fetch(user)
        let cmd = this.client.commands.get(command);
        interaction.user = u;
        interaction.member = await interaction.guild.members.fetch(user);
        interaction.memberPermissions = interaction.member.permissions;
        cmd.callback(interaction)
        return;
    }

}

export const data = new SlashCommandBuilder()
    .setName("senryu")
    .setDescription("Bot Utilities")
    .setDefaultPermission(false)
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
            .setName("js")
            .setDescription("Run node REPL")
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
            .setName("shell")
            .setDescription("Open a shell")
            .addStringOption(option => option.setName('command').setDescription('The command to run').setRequired(false))
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
            .setName("su")
            .setDescription("Runs a command as another user")
            .addUserOption(option => option.setName('target').setDescription('Select a user'))
            .addStringOption(option => option.setName('command').setDescription('The command to run'))
    )
    .addSubcommandGroup(
        new SlashCommandSubcommandGroupBuilder()
            .setName("ext")
            .setDescription("Extension Commands")
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName("load")
                    .setDescription("Loads an extension")
                    .addStringOption(option => option.setName('extension').setDescription('The extension to load'))
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName("unload")
                    .setDescription("Unloads an extension")
                    .addStringOption(option => option.setName('extension').setDescription('The extension to unload'))
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName("reload")
                    .setDescription("Reloads an extension")
                    .addStringOption(option => option.setName('extension').setDescription('The extension to reload'))
            )
    )

export const execute = async (interaction: HaikuCommandInteraction) => {
    const senryu = interaction.client.senryu;
    
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
            //desperately need to extend HaikuCommandInteraction to use HaikuClient instead of Client
            if(!interaction.client.commands.has(suCommand)) return interaction.followUp({ content: 'Command not found', ephemeral: true });
            await senryu.su(interaction, suAs, suCommand);
            break;
        default:
            interaction.reply("Invalid subcommand");
            break;
    }
    
}
