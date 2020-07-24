import { ConfigManager } from 'confmgr';

import * as configTypes from '../config/types.json';

/**
 * Object to house the values of all the configurable components for Sidecar.
 */
export interface ISidecarConfig {
	HOST: string;
	PORT: number;
	LOG_MODE: string;
	WS_URL: string;
	CUSTOM_TYPES: Record<string, string> | undefined;
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
}

function hr(): string {
	return Array(80).fill('━').join('');
}

export default class Config {
	/**
	 * Gather env vars for config and make sure they are valid.
	 */
	public static GetConfig(): ISidecarConfig | null {
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

		return {
			HOST: config.Get(MODULES.EXPRESS, CONFIG.BIND_HOST) as string,
			PORT: config.Get(MODULES.EXPRESS, CONFIG.PORT) as number,
			LOG_MODE: config.Get(MODULES.EXPRESS, CONFIG.LOG_MODE) as string,
			WS_URL: config.Get(MODULES.SUBSTRATE, CONFIG.WS_URL) as string,
			CUSTOM_TYPES: configTypes[CONFIG.CUSTOM_TYPES],
		};
	}
}
