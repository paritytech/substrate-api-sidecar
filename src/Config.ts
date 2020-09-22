import { ConfigManager } from 'confmgr';

import * as configTypes from '../config/types.json';

/**
 * Object to house the values of all the configurable components for Sidecar.
 */
export interface ISidecarConfig {
	EXPRESS: ISidecarConfigExpress;
	SUBSTRATE: ISidecarConfigSubstrate;
	LOG: ISidecarConfigLog;
}

export interface ISidecarConfigSubstrate {
	WS_URL: string;
	CUSTOM_TYPES: Record<string, string> | undefined;
}

export interface ISidecarConfigExpress {
	HOST: string;
	PORT: number;
}

export interface ISidecarConfigLog {
	LEVEL: string;
	JSON: boolean;
	FILTER_RPC: boolean;
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
	LEVEL = 'LEVEL',
	JSON = 'JSON',
	FILTER_RPC = 'FILTER_RPC',
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
			EXPRESS: {
				HOST: config.Get(MODULES.EXPRESS, CONFIG.BIND_HOST) as string,
				PORT: config.Get(MODULES.EXPRESS, CONFIG.PORT) as number,
			},
			SUBSTRATE: {
				WS_URL: config.Get(MODULES.SUBSTRATE, CONFIG.WS_URL) as string,
				CUSTOM_TYPES: configTypes[CONFIG.CUSTOM_TYPES],
			},
			LOG: {
				LEVEL: config.Get(MODULES.LOG, CONFIG.LEVEL) as string,
				JSON: config.Get(MODULES.LOG, CONFIG.JSON) as boolean,
				FILTER_RPC: config.Get(
					MODULES.LOG,
					CONFIG.FILTER_RPC
				) as boolean,
				STRIP_ANSI: config.Get(
					MODULES.LOG,
					CONFIG.STRIP_ANSI
				) as boolean,
			},
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
