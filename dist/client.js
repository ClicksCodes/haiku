"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
var discord_js_1 = require("discord.js");
/**
 * @class HaikuClient
 * @extends Client
 * @description This class is for the client
 * @author ClicksMinutePer
 */
var HaikuClient = /** @class */ (function (_super) {
    __extends(HaikuClient, _super);
    /**
     * @param ClientOptions options
     */
    function HaikuClient(ClientOptions, config) {
        var _this = _super.call(this, ClientOptions) || this;
        _this.ready = false;
        _this.commands = new discord_js_1.Collection();
        _this.config = config;
        _this.on("ready", function () {
            _this.ready = true;
            _this._log("-- Haiku Client Ready --");
            _this._log("Logged in as " + _this.user.tag);
            _this._log(_this.guilds.cache.size + " guilds");
            _this._log("-- Here we go! --");
        });
        _this.on("interactionCreate", function (interaction) { return __awaiter(_this, void 0, void 0, function () {
            var command, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!interaction.isCommand())
                            return [2 /*return*/];
                        command = this.commands.get(interaction.commandName);
                        if (!command)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, command["default"](interaction)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [4 /*yield*/, interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        return _this;
    }
    HaikuClient.prototype._log = function (message) {
        console.log("[HaikuClient @ " + new Date().toLocaleString() + "] : " + message);
    };
    HaikuClient.prototype._error = function (message) {
        console.error("[HaikuClient @ " + new Date().toLocaleString() + "] : " + message);
    };
    /**
     * @param command The Slash Command to add
     */
    HaikuClient.prototype.registerCommand = function (command, callback) {
        if (command == undefined || callback == undefined)
            return this;
        this.commands.set(command.name, { command: command, "default": callback });
        return this;
    };
    HaikuClient.prototype.registerEvent = function (event, callback) {
        var _this = this;
        if (event == undefined || callback == undefined)
            return this;
        this.on(event, function () {
            var eventData = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                eventData[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, callback.apply(void 0, __spreadArray([this], eventData))];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            this._error(error_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        return this;
    };
    HaikuClient.prototype.login = function (token) {
        if (token == undefined)
            token = this.config.dev ? this.config.devtoken : this.config.token;
        if (!token)
            throw new Error("No token provided!");
        return _super.prototype.login.call(this, token);
    };
    return HaikuClient;
}(discord_js_1.Client));
exports["default"] = HaikuClient;
