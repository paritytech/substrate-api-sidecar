// File for creating an exportable object that stores all config information
import { ConfigManager, ConfigObject } from 'confmgr';

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
	config: ConfigObject;
}

/**
 * Modules of Spec.yml
 */
export enum MODULES {
	EXPRESS = 'EXPRESS',
	SUBSTRATE = 'SUBSTRATE',
}

/**
 * Names of config env vars of Sidecar.
 */
export enum CONFIG {
	LOG_MODE = 'LOG_MODE',
	BIND_HOST = 'BIND_HOST',
	PORT = 'PORT',
	WS_URL = 'WS_URL',
	CUSTOM_TYPES = 'CUSTOM_TYPES',
	NAME = 'NAME',
}

// Instantiate ConfigManager which is used to read in the specs.yml
const config = ConfigManager.getInstance('specs.yml').getConfig();

export default {
	HOST: config.Get(MODULES.EXPRESS, CONFIG.BIND_HOST) as string,
	PORT: config.Get(MODULES.EXPRESS, CONFIG.PORT) as number,
	LOG_MODE: config.Get(MODULES.EXPRESS, CONFIG.LOG_MODE) as string,
	WS_URL: config.Get(MODULES.SUBSTRATE, CONFIG.WS_URL) as string,
	CUSTOM_TYPES: configTypes[CONFIG.CUSTOM_TYPES],
	NAME: config.Get('SUBSTRATE', CONFIG.NAME) as string,
	config,
} as SidecarConfig;
