import { MessageEmbed, MessageButton, MessageActionRow, CommandInteraction, Message, Collection } from "discord.js";
import HaikuClient from "./client";

interface Page {
    content?: string;
    fields?: Collection<string,string>
}

interface PaginatorOptions {
    maxFields?: number;
    maxDescriptionLength?: number;
    splitOnSpaces?: boolean;
}

export class HaikuPaginator {

    private pages:Page[] = [];
    private maxFields: number = 25;
    private maxDescriptionLength: number = 4096;
    private splitOnSpaces: boolean = true;
    private fields: Collection<string, string> = new Collection<string,string>();
    private description: string = "";

    /**
     * @param maxFields The maximum amount of fields per page (default: 25)
     * @param maxDescriptionLength The maximum amount of description characters per page (default: 4096)
     * @param splitOnSpaces Whether to attempt to split the description on spaces (default: true)
     */
    constructor(options?: PaginatorOptions) {
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
    getPage(page: number): Page {
        return this.pages[page];
    }

    addDescriptionContent(content: string, splitAfter: boolean = false) {
        let l = this.description.length;
        let c = content.length;
        this.description += content;
    }

    setDescription(description: string) {
        this.description = description;
    }

    addField(name: string, value: string) {

    }

    addFields(fields: Collection<string,string>) {

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