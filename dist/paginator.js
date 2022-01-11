"use strict";
exports.__esModule = true;
exports.Paginator = void 0;
var discord_js_1 = require("discord.js");
var Paginator = /** @class */ (function () {
    function Paginator(pages, interaction) {
        this.currentPage = 0;
        this.pages = pages;
        this.interaction = interaction;
        this.buttonList = [
            new discord_js_1.MessageActionRow()
                .addComponents(this.pages.slice(0, 4).map(function (p) { return new discord_js_1.MessageButton().setLabel(p.name).setCustomId(p.name.toLowerCase()).setStyle("SECONDARY"); }))
        ];
    }
    Paginator.prototype.getCurrentPage = function () {
        return this.pages[this.currentPage];
    };
    Paginator.prototype.nextPage = function () {
        this.currentPage++;
        if (this.currentPage >= this.pages.length) {
            this.currentPage = 0;
        }
        return this.getCurrentPage();
    };
    Paginator.prototype.previousPage = function () {
        this.currentPage--;
        if (this.currentPage < 0) {
            this.currentPage = this.pages.length - 1;
        }
        return this.getCurrentPage();
    };
    Paginator.prototype.goToPage = function (pageName) {
        this.currentPage = this.pages.indexOf(this.pages.filter(function (p) { return p.name === pageName; })[0]);
        return this.getCurrentPage();
    };
    return Paginator;
}());
exports.Paginator = Paginator;
