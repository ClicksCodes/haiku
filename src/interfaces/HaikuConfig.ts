type DEFAULT_COMMANDS = "SENRYU";

export interface HaikuConfig {
    token: string;
    activities?: string[];
    owners?: string[];
    devtoken?: string;
    devguild?: string;
    dev?: boolean;
    restrictToOwner?: boolean;
    //defaultCommands?: DEFAULT_COMMANDS[];
}