import {CommandInteraction} from "discord.js";
import {WrappedCheck} from "./Commands";

type DEFAULT_COMMANDS = "SENRYU";

export interface HaikuConfig {
    token: string;
    developmentToken?: string;

    ownerIDs?: string[];

    managementGuildID?: string;
    developmentGuildID?: string;

    enableDevelopment?: boolean;

    enableTextCommands?: boolean;
    prefix?: string | string[];

    defaultCheck?: WrappedCheck;
}