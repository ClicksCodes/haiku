import { MessageActionRow, MessageButton, MessageSelectMenu } from "discord.js";
class HaikuButton {
    constructor(id, label, style) {
        this.id = id ? id : (Math.random() * 100000).toString();
        this.label = label ? label : "Button";
        this.style = style ? style : "SECONDARY";
    }
}
class HaikuDropdown {
    //TODO: Add Min/Max
    //TODO: Add Disabled
    constructor(options, id, placeholder) {
        this.id = id ? id : (Math.random() * 100000).toString();
        this.placeholder = placeholder ? placeholder : "Select an option:";
        this.options = options ? options : [];
    }
}
export class HaikuUI {
    constructor(client) {
        this.ui = [];
        this.client = client;
    }
    button(options) {
        return new HaikuButton(options.id, options.label, options.style);
    }
    dropdown(options, id, placeholder) {
        return new HaikuDropdown(options, id, placeholder);
    }
    addRow(items) {
        if (this.ui.length === 3)
            return this.client._error("You can only have 3 rows");
        if (items instanceof HaikuDropdown) {
            this.ui.push(items);
            return this;
        }
        if (items.length > 5)
            return this.client._error("You can only have 5 items per row");
        this.ui.push(items);
        return this;
    }
    clear() {
        this.ui = [];
        this.client._notice("Cleared UI");
        return this;
    }
    setRows(rows) {
        if (rows.length > 3)
            return this.client._error("You can only have 3 rows");
        this.ui = rows;
        return this;
    }
    toComponent() {
        return this.ui.map((row) => {
            if (row instanceof HaikuDropdown) {
                return new MessageActionRow().addComponents(new MessageSelectMenu().setPlaceholder(row.placeholder).setOptions(row.options.map(o => { return { value: o.id, description: o.description, label: o.label }; })).setCustomId(row.id));
            }
            return new MessageActionRow().addComponents(row.map((button) => new MessageButton().setLabel(button.label).setCustomId(button.id).setStyle(button.style)));
        });
    }
}
