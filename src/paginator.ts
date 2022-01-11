import { MessageEmbed, MessageButton, MessageActionRow, CommandInteraction, Message } from "discord.js";
import { APIMessage } from "discord-api-types";
import HaikuClient from "./client";

interface Page {
    name: string,
    content: MessageEmbed,
    timeout: number
}

export class Paginator {
    private readonly pages: Page[];
    private currentPage: number = 0;
    private readonly interaction: CommandInteraction;
    private buttonList: MessageButton[];
    client: HaikuClient;

    constructor(pages: Page[], interaction: CommandInteraction, client: HaikuClient) {
        this.pages = pages;
        this.interaction = interaction;
        this.client = client;
        this.buttonList = this.pages.map(p => new MessageButton().setLabel(p.name).setCustomId(p.name.toLowerCase()).setStyle("SECONDARY"))
                
        
        
    }

    //TODO: Remake this
    async start(): Promise<void> {
        let m = await this.interaction.reply({
            embeds: [this.getCurrentPage().content],
            components: [new MessageActionRow().addComponents(this.buttonList.slice(this.currentPage - 2, this.currentPage + 3))],
            fetchReply: true
        })
        if(!(m instanceof Message)) return;
        try { 
            let b = m.awaitMessageComponent({filter: b => b.user.id === this.interaction.user.id, time: this.getCurrentPage().timeout})
            //TODO: Gave up on this, it's a mess
        } catch (error) {
            this.client._error(error);
        }
    }

    getCurrentPage(): Page {
        return this.pages[this.currentPage];
    }

    nextPage(): Page {
        this.currentPage++;
        if (this.currentPage >= this.pages.length) {
            this.currentPage = 0;
        }
        return this.getCurrentPage();
    }

    previousPage(): Page {
        this.currentPage--;
        if (this.currentPage < 0) {
            this.currentPage = this.pages.length - 1;
        }
        return this.getCurrentPage();
    }

    goToPage(pageName: string): Page {
        this.currentPage = this.pages.indexOf(this.pages.filter(p => p.name === pageName)[0]);
        return this.getCurrentPage();
    }
}