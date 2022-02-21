import {CommandInteraction} from "discord.js";

type DEFAULT_COMMANDS = "SENRYU";

export interface HaikuConfig {
    token: string;
    activities?: string[];
    owners?: string[];
    devtoken?: string;
    devguild?: string;
    dev?: boolean;
    restrictToOwner?: boolean;
    textCommands?: boolean;
    prefix?: string | string[];
    defaultCheck?: (interaction: CommandInteraction) => Promise<boolean> | boolean;
    //defaultCommands?: DEFAULT_COMMANDS[];
}