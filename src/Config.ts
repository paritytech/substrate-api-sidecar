import { ConfigManager } from 'confmgr';

import { setCodeBlocks } from '../config/setCodeBlocks';
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
	PARENT_VERSION: string;
}

/**
 * Modules of specs.yml
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
	PARENT_VERSION = 'PARENT_VERSION',
}

/**
 * Options for PARENT_VERSION enviroment variable.
 */
export enum ParentVersion {
	on = 'on',
	off = 'off',
}

function hr(): string {
	return Array(80).fill('━').join('');
}

export default class Config {
	static UPGRADE_BLOCKS: Record<string, true> | undefined;
	static PARENT_VERSION: ParentVersion;
	/*
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

		this.PARENT_VERSION = config.Get(
			MODULES.SUBSTRATE,
			CONFIG.PARENT_VERSION
		) as ParentVersion;

		return {
			HOST: config.Get(MODULES.EXPRESS, CONFIG.BIND_HOST) as string,
			PORT: config.Get(MODULES.EXPRESS, CONFIG.PORT) as number,
			LOG_MODE: config.Get(MODULES.EXPRESS, CONFIG.LOG_MODE) as string,
			WS_URL: config.Get(MODULES.SUBSTRATE, CONFIG.WS_URL) as string,
			CUSTOM_TYPES: configTypes[CONFIG.CUSTOM_TYPES],
			PARENT_VERSION: this.PARENT_VERSION,
		};
	}

	/**
	 * Set UPGRADE_BLOCKS static variable. This must be called when the server
	 * is being initialized to ensure hard coded block hashes are read in.
	 *
	 * @param specName the specName of the node sidecar is connected to.
	 */
	public static SetUpgradeBlocks(chainName: string): void {
		this.UPGRADE_BLOCKS = setCodeBlocks[chainName] as
			| Record<string, true>
			| undefined;
	}
}
