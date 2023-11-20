// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ConfigManager } from 'confmgr';

import { Specs } from './Specs';
import { CONFIG, ISidecarConfig, MODULES } from './types/sidecar-config';

function hr(): string {
	return Array(80).fill('━').join('');
}

/**
 * Access a singleton config object that will be intialized on first use.
 */
export class SidecarConfig {
	private static _config: ISidecarConfig | undefined;
	/**
	 * Gather env vars for config and make sure they are valid.
	 */
	private static create(): ISidecarConfig {
		// Instantiate ConfigManager which is used to read in the specs
		const config = ConfigManager.getInstance(Specs.specs).getConfig();

		if (!config.Validate()) {
			config.Print({ compact: false });
			console.log('Invalid config, we expect something like:');
			console.log(hr());
			console.log(config.GenEnv().join('\n'));
			console.log(hr());
			console.log('You may copy the snippet above in a .env.foobar file, then use it with:');
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
				KEEP_ALIVE_TIMEOUT: config.Get(MODULES.EXPRESS, CONFIG.KEEP_ALIVE_TIMEOUT) as number,
			},
			SUBSTRATE: {
				URL: config.Get(MODULES.SUBSTRATE, CONFIG.URL) as string,
				TYPES_BUNDLE: config.Get(MODULES.SUBSTRATE, CONFIG.TYPES_BUNDLE) as string,
				TYPES_CHAIN: config.Get(MODULES.SUBSTRATE, CONFIG.TYPES_CHAIN) as string,
				TYPES_SPEC: config.Get(MODULES.SUBSTRATE, CONFIG.TYPES_SPEC) as string,
				TYPES: config.Get(MODULES.SUBSTRATE, CONFIG.TYPES) as string,
			},
			LOG: {
				LEVEL: config.Get(MODULES.LOG, CONFIG.LEVEL) as string,
				JSON: config.Get(MODULES.LOG, CONFIG.JSON) as boolean,
				FILTER_RPC: config.Get(MODULES.LOG, CONFIG.FILTER_RPC) as boolean,
				STRIP_ANSI: config.Get(MODULES.LOG, CONFIG.STRIP_ANSI) as boolean,
				WRITE: config.Get(MODULES.LOG, CONFIG.WRITE) as boolean,
				WRITE_PATH: config.Get(MODULES.LOG, CONFIG.WRITE_PATH) as string,
				WRITE_MAX_FILE_SIZE: config.Get(MODULES.LOG, CONFIG.WRITE_MAX_FILE_SIZE) as number,
				WRITE_MAX_FILES: config.Get(MODULES.LOG, CONFIG.WRITE_MAX_FILES) as number,
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
