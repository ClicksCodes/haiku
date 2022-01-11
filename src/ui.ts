import { MessageActionRow, MessageButton, MessageButtonStyleResolvable, MessageSelectMenu } from "discord.js";
import HaikuClient from "./client";

type row = HaikuButton[] | HaikuDropdown;

interface HaikuButtonOptions {
    label: string;
    style?: MessageButtonStyleResolvable;
    id?: string;
}

class HaikuButton {
    id: string;
    label: string;
    style: MessageButtonStyleResolvable;

    constructor(id?: string, label?: string, style?: MessageButtonStyleResolvable) {
        this.id = id ? id : (Math.random() * 100000).toString();
        this.label = label ? label : "Button";
        this.style = style ? style : "SECONDARY";
    }
}

interface HaikuDropdownOptions {
    id?: string;
    label?: string;
    description?: string;
}

class HaikuDropdown {
    id: string;
    placeholder: string;
    options: HaikuDropdownOptions[];

    constructor(options: HaikuDropdownOptions[], id?: string, placeholder?: string) {
        this.id = id ? id : (Math.random() * 100000).toString();
        this.placeholder = placeholder ? placeholder : "Select an option:";
        this.options = options ? options : [];
    }
}

export class HaikuUI {
    public client: HaikuClient;

    private ui:row[] = [];

    constructor(client: HaikuClient) {
        this.client = client;
    }

    button(options: HaikuButtonOptions):HaikuButton {
        return new HaikuButton(options.id, options.label, options.style);
    }

    dropdown(options: HaikuDropdownOptions[], id?: string, placeholder?: string):HaikuDropdown {
        return new HaikuDropdown(options, id, placeholder);
    }

    addRow(items: HaikuButton[] | HaikuDropdown):this | void {
        if(this.ui.length === 3) return this.client._error("You can only have 3 rows");
        if(items instanceof HaikuDropdown) {
            this.ui.push(items);
            return this;
        }
        if(items.length > 5) return this.client._error("You can only have 5 items per row");
        this.ui.push(items);
        return this;
    }

    setRows(rows: row[]):this | void {
        if(rows.length > 3) return this.client._error("You can only have 3 rows");
        this.ui = rows;
        return this;
    }

    toComponent() {
        return this.ui.map(
            (row) => {
                if(row instanceof HaikuDropdown) {
                    return new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder(row.placeholder).setOptions(row.options.map(o => {return {value: o.id, description: o.description, label: o.label}})).setCustomId(row.id));
                }
                return new MessageActionRow().addComponents(
                    row.map(
                        (button) => new MessageButton().setLabel(button.label).setCustomId(button.id).setStyle(button.style)
                    )
                );
            }
        )
    }

}