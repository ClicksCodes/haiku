import * as Haiku from './typings/index'

const colors = {
    Danger: 0xf27878,
    Warning: 0xf2d478,
    Success: 0x68d49e
}

export class EmojiEmbed extends Haiku.EmbedBuilder {
    readonly client: Haiku.Client<true>
    _title: string = ''
    _emoji: string = ''
    description = ''

    constructor(client: Haiku.Client<true>, data?: Haiku.EmbedData | Haiku.APIEmbed) {
        super(data)
        this.client = client;
    }

    _generateTitle() {
        if (this._emoji && !this._title) return this._emoji
        if (this._emoji) { return `${this._emoji} ${this._title}`; }
        if (this._title) { return this._title };
        return "";
    }


    override setTitle(title: string) {
        this._title = title;
        const proposedTitle = this._generateTitle();
        if (proposedTitle) super.setTitle(proposedTitle);
        return this;
    }

    override setDescription(description: string) {
        this.description = description;
        super.setDescription(description);
        return this;
    }

    setEmoji(emoji: Haiku.Emoji | string) {
        this._emoji = this.client.logger.renderEmoji(emoji)
        const proposedTitle = this._generateTitle();
        if (proposedTitle) super.setTitle(proposedTitle);
        return this;
    }

    setStatus(color: Haiku.StatusColors) {
        this.setColor(colors[color]);
        return this;
    }

}