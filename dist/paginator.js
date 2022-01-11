import { Collection } from "discord.js";
export class HaikuPaginator {
    /**
     * @param maxFields The maximum amount of fields per page (default: 25)
     * @param maxDescriptionLength The maximum amount of description characters per page (default: 4096)
     * @param splitOnSpaces Whether to attempt to split the description on spaces (default: true)
     */
    constructor(options) {
        this.pages = [];
        this.maxFields = 25;
        this.maxDescriptionLength = 4096;
        this.splitOnSpaces = true;
        this.fields = new Collection();
        this.description = "";
        this.maxFields = options?.maxFields ?? 25;
        this.maxDescriptionLength = options?.maxDescriptionLength ?? 4096;
        this.splitOnSpaces = options?.splitOnSpaces ?? true;
    }
    /**
     * Get a page from the paginator
     * @param {number} page The page number
     *
     * @returns The page
     */
    getPage(page) {
        return this.pages[page];
    }
    addDescriptionContent(content, splitAfter = false) {
        let l = this.description.length;
        let c = content.length;
        this.description += content;
    }
    setDescription(description) {
        this.description = description;
    }
    addField(name, value) {
    }
    addFields(fields) {
    }
}
/*
    Embed descriptions are limited to 4096 characters
    There can be up to 25 fields
    The sum of all characters from all embed structures in a message must not exceed 6000 characters

    maxFields must not exceed 25
    maxDescriptionLength must not exceed 4096

    https://discordjs.guide/popular-topics/embeds.html#embed-limits
*/ 
