import * as Haiku from './index';
import type { EmojiEmbed } from '../emojiEmbed';

export interface Renders {
    renderEmoji(emoji: Haiku.Emoji | string): string,
    renderUser(user: Haiku.User | string): string,
    renderChannel(channel: Haiku.Channel | string): string,
    renderRole(guild: Haiku.Guild | string, role: Haiku.Role | string): string,
    renderTime(time: number): string,
    renderDelta(delta: number): string,
    renderNumberDelta(num1: number, num2: number): string,
    renderCommand(path: string): string,
    generateEmojiEmbed(client: Haiku.Client, data?: Haiku.EmbedData | Haiku.APIEmbed): EmojiEmbed
}