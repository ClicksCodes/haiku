import { MessageEmbed, Interaction, MessageButton, MessageActionRow } from "discord.js";

interface Page {
    name: string,
    content: MessageEmbed,
    timeout: number
}

export class Paginator {
    private readonly pages: Page[];
    private currentPage: number = 0;
    private readonly interaction: Interaction;
    private buttonList: MessageActionRow[];

    constructor(pages: Page[], interaction: Interaction, ) {
        this.pages = pages;
        this.interaction = interaction;
        this.buttonList = [
            new MessageActionRow()
                .addComponents(
                    this.pages.slice(0,4).map(p => new MessageButton().setLabel(p.name).setCustomId(p.name.toLowerCase()).setStyle("SECONDARY"))
                )
        ]
    }

    

    public getCurrentPage(): Page {
        return this.pages[this.currentPage];
    }

    public nextPage(): Page {
        this.currentPage++;
        if (this.currentPage >= this.pages.length) {
            this.currentPage = 0;
        }
        return this.getCurrentPage();
    }

    public previousPage(): Page {
        this.currentPage--;
        if (this.currentPage < 0) {
            this.currentPage = this.pages.length - 1;
        }
        return this.getCurrentPage();
    }

    public goToPage(pageName: string): Page {
        this.currentPage = this.pages.indexOf(this.pages.filter(p => p.name === pageName)[0]);
        return this.getCurrentPage();
    }
}