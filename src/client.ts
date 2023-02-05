import { HaikuDB } from './database'
import * as Haiku from './typings/index'
import * as fs from 'fs';
import {argv} from 'process'

async function registerCommands(commandsPath: fs.PathLike) {
    const files = fs.readdirSync(commandsPath, { withFileTypes: true });
    let unprocessed: Haiku.CommandData<Haiku.builderTypes, Haiku.UserTypes>[] = []
    for (const file of files) {
        if(file.isDirectory()) {
            const subCommands = await registerCommands(`${commandsPath}/${file.name}`)
            unprocessed.push(...subCommands)
        } else if(file.isFile() && file.name.endsWith('.js')) {
            const command = await import(`${commandsPath}/${file}`)
            unprocessed.push(command)
        }
    }
    return unprocessed
}

async function registerEvents(eventsPath: fs.PathLike) {
    const files = fs.readdirSync(eventsPath, { withFileTypes: true });
    let unprocessed: Haiku.EventsData[] = []
    for (const file of files) {
        if(file.isFile() && file.name.endsWith('.js')) {
            const event = await import(`${eventsPath}/${file}`)
            unprocessed.push(event)
        }
    }
    return unprocessed
}

function registerContextMenu(contextMenuPath: fs.PathLike): any {
    const files = fs.readdirSync(contextMenuPath, { withFileTypes: true });
    let unprocessed: Haiku.ContextMenuData[] = []
    for(const file of files) {
        if(file.isFile() && file.name.endsWith('.js')) {
            const contextMenu = require(`${contextMenuPath}/${file}`)
            unprocessed.push(contextMenu)
        } else if(file.isDirectory()) {
            const subCommands = registerContextMenu(`${contextMenuPath}/${file.name}`)
            unprocessed.push(...subCommands)
        }
    }
}

export class HaikuClient extends Haiku.Client implements Haiku.Client {
    constructor(options: Haiku.ClientOptions & Haiku.HaikuClientOptions) {
        super(options as Haiku.ClientOptions)
        this.database = new HaikuDB(options.mongoURL)
        this.commands = new Haiku.Collection()
        this.haikuOptions = options as Haiku.HaikuClientOptions

        super.on('ready', async () => {
            await this.registerAll(argv.includes('register')? true : false)
        });

        super.on('interactionCreate', async (interaction: Haiku.Interaction) => {
            if (interaction.isChatInputCommand()) {
                const { commandName } = interaction
                const subCommandGroup = interaction.options.getSubcommandGroup(false)
                const subCommand = interaction.options.getSubcommand(false)
                let path = ['commands', commandName, subCommandGroup, subCommand]
                const command = this.commands.get(path.filter(v => v).join('/'))
                if (command) {
                    for(const check of command.checks) {
                        if(!await check(interaction)) return
                    }
                }
            } else if (interaction.isUserContextMenuCommand()) {
                const { commandName } = interaction
                let path = ['context', 'user', commandName]
                const command = this.commands.get(path.filter(v => v).join('/'))
                if (command) {
                    if (await command.check(interaction)) {
                        command.execute(interaction)
                    }
                }
            } else if (interaction.isMessageContextMenuCommand()) {
                const { commandName } = interaction
                let path = ['context', 'message', commandName]
                const command = this.commands.get(path.filter(v => v).join('/'))
                if (command) {
                    if (await command.check(interaction)) {
                        command.execute(interaction)
                    }
                }
            }
        });

    }

    override async registerAll(_updateDiscord: boolean = false): Promise<void> {
        let commands: Haiku.CommandData<Haiku.builderTypes, Haiku.UserTypes>[] = [];
        let events: Haiku.EventsData[] = [];
        let contextMenu: Haiku.ContextMenuData[] = [];
        if(this.haikuOptions.commandsPath) {
            commands = await registerCommands(this.haikuOptions.commandsPath)
        }
        if(this.haikuOptions.eventsPath) {
            events = await registerEvents(this.haikuOptions.eventsPath)
        }
        if(this.haikuOptions.contextMenuPath) {
            contextMenu = await registerContextMenu(this.haikuOptions.contextMenuPath)
        }

        if (commands.length > 0) {

        }

        if (events.length > 0) {
            for(const event of events) {
                const {name, callback} = event
                this.on(name, callback)
            }
        }

        if (contextMenu.length > 0) {

        }
    }

}

