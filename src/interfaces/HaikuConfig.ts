type DEFAULT_COMMANDS = "SENRYU";

export interface HaikuConfig {
    token: string;
    activities?: string[];
    owners?: string[];
    devtoken?: string;
    devguild?: string;
    dev?: boolean;
    //defaultCommands?: DEFAULT_COMMANDS[];
}