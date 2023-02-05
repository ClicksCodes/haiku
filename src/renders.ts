import { EmojiEmbed } from './emojiEmbed'
import * as Haiku from './typings/index'
import type { Renders } from './typings/renders'

export class Render extends Haiku.Base implements Renders {

    constructor(client: Haiku.Client) {
        super(client)
    }
    renderTime(time: number): string {
        time = Math.floor((time /= 1000))
        return `<t:${time}:D> at <t:${time}:T>`
    }
    renderDelta(delta: number): string {
        delta = Math.floor((delta /= 1000));
        return `<t:${delta}:R> (<t:${delta}:D> at <t:${delta}:T>)`;
    }
    renderNumberDelta(num1: number, num2: number): string {
        const delta = num2 - num1;
        return `${num1} -> ${num2} (${delta > 0 ? "+" : ""}${delta})`;
    }

    renderEmoji(emoji: Haiku.Emoji | string) {
        if(typeof emoji === 'string') {
            emoji = this.client.emojis.resolve(emoji) as Haiku.Emoji
        }
        return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`
    }

    renderUser(user: Haiku.User | string) {
        if(typeof user === 'string') {
            user = this.client.users.resolve(user) as Haiku.User
        }
        return `<@${user.id}>`
    }

    renderChannel(channel: Haiku.Channel | string) {
        if(typeof channel === 'string') {
            channel = this.client.channels.resolve(channel) as Haiku.Channel
        }
        return `<#${channel.id}>`
    }

    renderRole(guild: Haiku.Guild | string, role: Haiku.Role | string) {
        if(typeof guild === 'string') {
            guild = this.client.guilds.resolve(guild) as Haiku.Guild
        }
        if(typeof role === 'string') {
            role = guild.roles.resolve(role) as Haiku.Role
        }
        return `<@&${role.id}>`
    }

    renderCommand(path: string) {
        return `${path}`; // TODO: Not yet implemented
    }

    generateEmojiEmbed(client: Haiku.Client, data?: Haiku.EmbedData | Haiku.APIEmbed) {
        return new EmojiEmbed(client, data)
    }


}