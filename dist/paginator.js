import { MessageButton, MessageActionRow } from "discord.js";
export class Paginator {
    constructor(pages, interaction) {
        this.currentPage = 0;
        this.pages = pages;
        this.interaction = interaction;
        this.buttonList = [
            new MessageActionRow()
                .addComponents(this.pages.slice(0, 4).map(p => new MessageButton().setLabel(p.name).setCustomId(p.name.toLowerCase()).setStyle("SECONDARY")))
        ];
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
