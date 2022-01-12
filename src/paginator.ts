import { MessageEmbed, MessageButton, MessageActionRow, CommandInteraction, Message, Collection } from "discord.js";
import HaikuClient from "./client";

interface field {name: string, value: string, inline: boolean};


interface PaginatorOptions {
    maxFields?: number;
    maxDescriptionLength?: number;
    splitOnSpaces?: boolean;
}

export class HaikuPaginator {

    private page:number = -1;
    private maxFields: number = 25;
    private maxDescriptionLength: number = 4096;
    private splitOnSpaces: boolean = true;
    private fields: field[] = [];
    private description: string = "";
    private embed: MessageEmbed;
    private _descriptionStartEndMemo: {[page: number]: [number, number]} = {};

    public* getIterator() {
        this.page = -1;
        while (true) {
            let page = this.next();
            if (!page) return page;

            yield page;
        }
    }

    /**
     * @param maxFields The maximum amount of fields per page (default: 25)
     * @param maxDescriptionLength The maximum amount of description characters per page (default: 4096)
     * @param splitOnSpaces Attempt to split the description on spaces (default: true)
     * @description Creates a new paginator, can force page split with \f
     */
    constructor(embed:MessageEmbed, options: PaginatorOptions = {}) {
        this.maxFields = options?.maxFields ?? 25;
        this.maxDescriptionLength = options?.maxDescriptionLength ?? 4096;
        this.splitOnSpaces = options?.splitOnSpaces ?? true;
        this.embed = embed;
    }


    addDescriptionContent(content: string, splitAfter: boolean = false) {
        this.description += content;
    }

    setDescription(description: string) {
        this.description = description;
        this._descriptionStartEndMemo = {};
    }

    addField(name: string, value: string) {
        this.fields.push({name, value, inline: false});
    }

    addFields(fields: field[]) {
        this.fields = this.fields.concat(fields);
    }

    /**
     * @param page The page to get
     * @description Gets the start and end index of the page description
     * @returns An array with the start and end index of the page, as well as a boolean of if the page ended with a space
     */
    private getPageDescriptionStartEnd(page: number): [number, number] {
        //TODO: Fix not Split on spaces
        if(!this.splitOnSpaces) return [page*this.maxDescriptionLength, Math.min(((page+1)*this.maxDescriptionLength), this.description.length)];

        if(this._descriptionStartEndMemo[page] && this._descriptionStartEndMemo[page + 1]) return this._descriptionStartEndMemo[page];

        let start = page === 0 ? 0 : this.getPageDescriptionStartEnd(page - 1)[1];
        let endF = this.description.indexOf('\f', start) === -1 ? Infinity : this.description.indexOf('\f', start) - start;
        let endS:number;
        while(this.description.substring(start).startsWith(' ')) {
            start++;
        }
        if(this.description.substring(start, start + this.maxDescriptionLength + 1).endsWith(' ')) {
            endS = this.maxDescriptionLength;
        } else if(start + this.maxDescriptionLength > this.description.length) {
            endS = this.description.length;
        } else {
            endS = this.description.substring(start, start + this.maxDescriptionLength).lastIndexOf(' ');
        }
        let length = Math.min(endF, endS);

        if (start != Math.min(length + start, this.description.length)) this._descriptionStartEndMemo[page] = [start, Math.min(length + start, this.description.length)];

        return [start, Math.min(length + start, this.description.length)]
    }

    private getFields(page: number): field[] {
        if(page*this.maxFields > this.fields.length) return [];
        let end = Math.min((page + 1) * this.maxFields, this.fields.length);
        return this.fields.slice(page * this.maxFields, end);
    }

    getEmbed(page: number = this.page): MessageEmbed {
        this.page = page;
        let fields = this.getFields(page);
        let description = this.getPageDescriptionStartEnd(page);

        this.embed.fields = fields;
        this.embed.description = this.description.substring(description[0], description[1]);


        if (this.embed.fields.length === 0 && this.embed.description === "") return null;

        return this.embed;
    }

    next(): MessageEmbed {
        this.page++;
        let page = this.getEmbed(this.page);
        if (!page) this.page--;
        return page;
    }

    prev(): MessageEmbed {
        if (this.page < 1) return null;
        this.page--;
        return this.getEmbed(this.page);
    }

}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#iterables

/*
    Embed descriptions are limited to 4096 characters
    There can be up to 25 fields
    The sum of all characters from all embed structures in a message must not exceed 6000 characters

    maxFields must not exceed 25
    maxDescriptionLength must not exceed 4096

    https://discordjs.guide/popular-topics/embeds.html#embed-limits
*/