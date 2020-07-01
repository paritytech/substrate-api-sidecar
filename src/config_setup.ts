// File for creating an exportable object that stores all config information
import { ConfigManager } from 'confmgr';

import * as configTypes from '../config/types.json';

/**
 * Object to house the values of all the configurable components for Sidecar.
 */
export interface SidecarConfig {
	HOST: string;
	PORT: number;
	LOG_MODE: string;
	WS_URL: string;
	CUSTOM_TYPES: Record<string, string> | undefined;
	NAME: string;
}

/**
 * Modules of Spec.yaml
 */
export enum MODULES {
	EXPRESS = 'EXPRESS',
	SUBSTRATE = 'SUBSTRATE',
}

/**
 * Names of config env vars of Sidecar.
 */
export enum CONFIG {
	WS_URL = 'WS_URL',
	LOG_MODE = 'LOG_MODE',
	BIND_HOST = 'BIND_HOST',
	PORT = 'PORT',
	NAME = 'NAME',
	CUSTOM_TYPES = 'CUSTOM_TYPES',
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
	CUSTOM_TYPES: configTypes[CONFIG.CUSTOM_TYPES],
	NAME: config.Get('SUBSTRATE', CONFIG.NAME) as string,
} as SidecarConfig;
