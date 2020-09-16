import { ConfigManager } from 'confmgr';

import * as configTypes from '../config/types.json';

/**
 * Object to house the values of all the configurable components for Sidecar.
 */
export interface ISidecarConfig {
	HOST: string;
	PORT: number;
	WS_URL: string;
	CUSTOM_TYPES: Record<string, string> | undefined;
	CONSOLE_LEVEL: string;
	CONSOLE_JSON: boolean;
	CONSOLE_FILTER_RPC: boolean;
	FILE_USE: boolean;
	FILE_LEVEL: string;
	FILE_SIZE: number;
	FILE_COUNT: number;
	FILE_PATH: string;
	STRIP_ANSI: boolean;
}

/**
 * Modules of specs.yml
 */
export enum MODULES {
	EXPRESS = 'EXPRESS',
	SUBSTRATE = 'SUBSTRATE',
	LOG = 'LOG',
}

/**
 * Names of config env vars of Sidecar.
 */
export enum CONFIG {
	BIND_HOST = 'BIND_HOST',
	PORT = 'PORT',
	WS_URL = 'WS_URL',
	CUSTOM_TYPES = 'CUSTOM_TYPES',
	CONSOLE_LEVEL = 'CONSOLE_LEVEL',
	CONSOLE_JSON = 'CONSOLE_JSON',
	CONSOLE_FILTER_RPC = 'CONSOLE_FILTER_RPC',
	FILE_USE = 'FILE_USE',
	FILE_LEVEL = 'FILE_LEVEL',
	FILE_SIZE = 'FILE_SIZE',
	FILE_COUNT = 'FILE_COUNT',
	FILE_PATH = 'FILE_PATH',
	STRIP_ANSI = 'STRIP_ANSI',
}

function hr(): string {
	return Array(80).fill('━').join('');
}

/**
 * Access a singleton config object that will be intialized on first use.
 */
export class Config {
	private static _config: ISidecarConfig | undefined;
	/**
	 * Gather env vars for config and make sure they are valid.
	 */
	private static create(): ISidecarConfig {
		// Instantiate ConfigManager which is used to read in the specs.yml
		const config = ConfigManager.getInstance('specs.yml').getConfig();

		if (!config.Validate()) {
			config.Print({ compact: false });
			console.log('Invalid config, we expect something like:');
			console.log(hr());
			console.log(config.GenEnv().join('\n'));
			console.log(hr());
			console.log(
				'You may copy the snippet above in a .env.foobar file, then use it with:'
			);
			console.log('    NODE_ENV=foobar yarn start\n');
			console.log('Invalid config, exiting...');
			process.exit(1);
		} else {
			config.Print({ compact: true });
		}

		this._config = {
			HOST: config.Get(MODULES.EXPRESS, CONFIG.BIND_HOST) as string,
			PORT: config.Get(MODULES.EXPRESS, CONFIG.PORT) as number,
			WS_URL: config.Get(MODULES.SUBSTRATE, CONFIG.WS_URL) as string,
			CUSTOM_TYPES: configTypes[CONFIG.CUSTOM_TYPES],
			CONSOLE_LEVEL: config.Get(
				MODULES.LOG,
				CONFIG.CONSOLE_LEVEL
			) as string,
			CONSOLE_JSON: config.Get(
				MODULES.LOG,
				CONFIG.CONSOLE_JSON
			) as boolean,
			CONSOLE_FILTER_RPC: config.Get(
				MODULES.LOG,
				CONFIG.CONSOLE_FILTER_RPC
			) as boolean,
			FILE_USE: config.Get(MODULES.LOG, CONFIG.FILE_USE) as boolean,
			FILE_LEVEL: config.Get(MODULES.LOG, CONFIG.FILE_LEVEL) as string,
			FILE_SIZE: config.Get(MODULES.LOG, CONFIG.FILE_SIZE) as number,
			FILE_COUNT: config.Get(MODULES.LOG, CONFIG.FILE_COUNT) as number,
			FILE_PATH: config.Get(MODULES.LOG, CONFIG.FILE_PATH) as string,
			STRIP_ANSI: config.Get(MODULES.LOG, CONFIG.STRIP_ANSI) as boolean,
		};

		return this._config;
	}

	/**
	 * Sidecar's configuaration.
	 */
	static get config(): ISidecarConfig {
		return this._config || this.create();
	}
}
