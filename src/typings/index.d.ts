import * as Dis from 'discord.js'
import { Collection, SlashCommandBuilder } from 'discord.js'
import { MongoDatabase } from './database'
import { PathLike } from 'fs'


declare module 'discord.js' {

    export interface CommandData<builderType extends builderTypes, checkUserType extends UserTypes> {
        id?: string,
        name: string,
        description: string,
        execute(interaction: CommandInteraction): Promise<unknown>,
        checks: checkType<checkUserType>[],
        command?: builderType,
        autocomplete?(interaction: AutocompleteInteraction): Promise<string[]>
    }

    export interface EventsData {
        name: keyof ClientEvents
        callback: (...args: any) => Promise<void>
    }

    export interface ContextMenuData {
        id?: string,
        name: string,
        description: string,
        execute(interaction: CommandInteraction): Promise<unknown>,
        check(interaction: CommandInteraction): Promise<boolean>,
        command: ContextMenuBuilder
    }

    export interface Client {
        haikuOptions: HaikuClientOptions,
        database: MongoDatabase,
        commands: Collection<string, CommandData>
        registerAll(updateDiscord: boolean): Promise<void>
    }

    export type builderTypes = Dis.SlashCommandBuilder | Dis.SlashCommandSubcommandBuilder | Dis.SlashCommandSubcommandGroupBuilder;
    export type ctxMenuTypes = UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction;
    export interface HaikuClientOptions {
        mongoURL: string
        commandsPath?: PathLike
        eventsPath?: PathLike
        contextMenuPath?: PathLike
    }

    export interface CommandBuilderOptionsSubset<builderType extends builderTypes, checkUserType extends UserTypes> {
        name?: string,
        description?: string,
        command?: builderType,
        execute?(interaction: CommandInteraction): Promise<unknown>,
        checks?: checkType<checkUserType>[],
        autocomplete?(interaction: AutocompleteInteraction): Promise<string[]>,
    }

    export type AllowedLocations = ['Guild' | 'DM', ...('Guild' | 'DM')[]];

    export type CommandBuilderOptions<builderType extends builderTypes, checkUserType extends UserTypes> = CommandBuilderOptionsSubset<builderType, checkUserType> & { allowedLocations: AllowedLocations };
    export type UserTypes = Dis.GuildMember | Dis.User;
    export type checkType<UserType extends UserTypes> = (user: UserType) => Promise<boolean | string>;

    export interface CommandBuilder<
    builderType extends Dis.builderTypes,
    checkUserType extends Dis.UserTypes
    > {
        data: CommandData,
        addChecks(checks: checkType<checkUserType> | checkType<checkUserType>[]): this,
        setChecks(checks: checkType<checkUserType> | checkType<checkUserType>[]): this,
        setAutocomplete(autocomplete: (interaction: AutocompleteInteraction) => Promise<string[]>): this,
        setCallback(callback: (interaction: CommandInteraction) => Promise<unknown>): this,
        execute(interaction: CommandInteraction): Promise<unknown>,
        setCommand(command: builderType): this,
    }

    export interface ContextMenuBuilder<ctxMenuType extends ctxMenuTypes> {
        data: ContextMenuData,
    }
}


export = Dis