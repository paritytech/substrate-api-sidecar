import { ConfigManager } from 'confmgr';

import * as configTypes from '../config/types.json';

// File for creating an exportable object that stores all config information

/**
 * All of the configurable components of sidecar.
 */
export interface SidecarConfig {
	HOST: string;
	PORT: number;
	LOG_MODE: string;
	WS_URL: string;
	CUSTOM_TYPES: Record<string, string> | undefined;
}

// Enums to avoid fat finger errors
export enum MODULES {
	EXPRESS = 'EXPRESS',
	SUBSTRATE = 'SUBSTRATE',
}

export enum CONFIG {
	WS_URL = 'WS_URL',
	LOG_MODE = 'LOG_MODE',
	BIND_HOST = 'BIND_HOST',
	PORT = 'PORT',
	NAME = 'NAME',
}

// Instantiate ConfigManager which is used to read in the specs.yml
const config = ConfigManager.getInstance('specs.yml').getConfig();
// Print some nice info that also gives informative error messages
config.Print({ compact: true });

export default {
	HOST: config.Get(MODULES.EXPRESS, CONFIG.BIND_HOST) as string,
	PORT: config.Get(MODULES.EXPRESS, CONFIG.PORT) as number,
	LOG_MODE: config.Get(MODULES.EXPRESS, CONFIG.LOG_MODE) as string,
	WS_URL: config.Get(MODULES.SUBSTRATE, CONFIG.WS_URL) as string,
	CUSTOM_TYPES: configTypes['CUSTOM_TYPES'],
	NAME: config.Get('SUBSTRATE', CONFIG.NAME) as string,
};
