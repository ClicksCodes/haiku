import { MessageButton, MessageActionRow, Message } from "discord.js";
export class Paginator {
    constructor(pages, interaction, client) {
        this.currentPage = 0;
        this.pages = pages;
        this.interaction = interaction;
        this.client = client;
        this.buttonList = this.pages.map(p => new MessageButton().setLabel(p.name).setCustomId(p.name.toLowerCase()).setStyle("SECONDARY"));
    }
    //TODO: Remake this
    async start() {
        let m = await this.interaction.reply({
            embeds: [this.getCurrentPage().content],
            components: [new MessageActionRow().addComponents(this.buttonList.slice(this.currentPage - 2, this.currentPage + 3))],
            fetchReply: true
        });
        if (!(m instanceof Message))
            return;
        try {
            let b = m.awaitMessageComponent({ filter: b => b.user.id === this.interaction.user.id, time: this.getCurrentPage().timeout });
            //TODO: Gave up on this, it's a mess
        }
        catch (error) {
            this.client._error(error);
        }
    }
    getCurrentPage() {
        return this.pages[this.currentPage];
    }
    nextPage() {
        this.currentPage++;
        if (this.currentPage >= this.pages.length) {
            this.currentPage = 0;
        }
        return this.getCurrentPage();
    }
    previousPage() {
        this.currentPage--;
        if (this.currentPage < 0) {
            this.currentPage = this.pages.length - 1;
        }
        return this.getCurrentPage();
    }
    goToPage(pageName) {
        this.currentPage = this.pages.indexOf(this.pages.filter(p => p.name === pageName)[0]);
        return this.getCurrentPage();
    }
}
