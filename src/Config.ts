import { ConfigManager } from 'confmgr';

import * as configTypes from '../config/types.json';
import { Specs } from './Specs';
import { CONFIG, ISidecarConfig, MODULES } from './types/config';

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
		const config = ConfigManager.getInstance(Specs.specs).getConfig();

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
