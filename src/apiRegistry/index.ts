/* eslint-disable @typescript-eslint/no-var-requires */
import { ApiPromise } from '@polkadot/api';
import { HttpProvider, WsProvider } from '@polkadot/rpc-provider';
import { OverrideBundleType, RegistryTypes } from '@polkadot/types/types';

import { Log } from '../logging/Log';
import tempTypesBundle from '../override-types/typesBundle';
import { SidecarConfig } from '../SidecarConfig';
import { MultiKeyBiMap } from '../util/MultiKeyBiMap';

export interface AssetHubInfo {
	isAssetHub: boolean;
	isAssetHubMigrated: boolean;
}

export class ApiPromiseRegistry {
	// SpecName to ApiPromise instances
	private static _instancesBySpecName: Map<string, Array<ApiPromise>> = new Map();
	// SpecName to Type map
	private static specNameToTypeMap = new MultiKeyBiMap<string, string>();
	// RPC URL to ApiPromise instance
	private static _instancesByUrl: Map<string, ApiPromise> = new Map();
	// Asset hub info, will default to static unless its connected.
	public static assetHubInfo: AssetHubInfo = {
		isAssetHub: false,
		isAssetHubMigrated: false,
	};

	public static setAssetHubInfo(info: AssetHubInfo) {
		this.assetHubInfo.isAssetHub = info.isAssetHub;
		this.assetHubInfo.isAssetHubMigrated = info.isAssetHubMigrated;
	}

	/**
	 * Get the ApiPromise instance for the given spec name.
	 * @param specName The spec name to get the ApiPromise instance for.
	 * @returns The ApiPromise instance for the given spec name.
	 */
	public static async initApi(url: string, type?: 'relay' | 'assethub' | 'parachain'): Promise<ApiPromise> {
		const { logger } = Log;
		logger.info(`Initializing API for ${url}`);

		// TODO: for now use instance by URL as a staging check to make sure we don't need to recreate an API instance
		if (!this._instancesByUrl.has(url)) {
			const { config } = SidecarConfig;

			const { TYPES_BUNDLE, TYPES_SPEC, TYPES_CHAIN, TYPES, CACHE_CAPACITY } = config.SUBSTRATE;
			// Instantiate new API Promise instance
			const api = await ApiPromise.create({
				provider: url.startsWith('http')
					? new HttpProvider(url, undefined, CACHE_CAPACITY || 1000)
					: new WsProvider(url, undefined, undefined, undefined, CACHE_CAPACITY || 1000),
				// only use extra types if the url is the same as the one in the config
				...(config.SUBSTRATE.URL === url
					? {
							typesBundle: TYPES_BUNDLE
								? (require(TYPES_BUNDLE) as OverrideBundleType)
								: (tempTypesBundle as OverrideBundleType),
							typesChain: TYPES_CHAIN ? (require(TYPES_CHAIN) as Record<string, RegistryTypes>) : undefined,
							typesSpec: TYPES_SPEC ? (require(TYPES_SPEC) as Record<string, RegistryTypes>) : undefined,
							types: TYPES ? (require(TYPES) as RegistryTypes) : undefined,
						}
					: {}),
			});

			const { specName } = await api.rpc.state.getRuntimeVersion();

			if (!this.specNameToTypeMap.getByKey(specName.toString())) {
				if (type) {
					this.specNameToTypeMap.set(specName.toString(), type);
				}
			}
			// TODO: use a generic store for APis and use a unique Id to reference URLs and specNames
			if (this._instancesBySpecName.has(specName.toString())) {
				const existingInstances = this._instancesBySpecName.get(specName.toString())!;
				this._instancesBySpecName.set(specName.toString(), [...existingInstances, api]);
			} else {
				this._instancesBySpecName.set(specName.toString(), [api]);
			}
			this._instancesByUrl.set(url, api);

			logger.info(`API initialized for ${url} with specName ${specName.toString()}`);
		} else {
			const api = this._instancesByUrl.get(url);
			// make sure we have stored the type for the SUBSTRATE_URL option
			if (api && type) {
				const { specName } = await api.rpc.state.getRuntimeVersion();

				if (!this.specNameToTypeMap.getByKey(specName.toString())) {
					if (type) {
						this.specNameToTypeMap.set(specName.toString(), type);
					}
				}
			}
		}

		return this._instancesByUrl.get(url)!;
	}

	public static getApi(specName: string): ApiPromise | undefined {
		const api = this._instancesBySpecName.get(specName);
		if (!api) {
			throw new Error(`API not found for specName: ${specName}`);
		}
		// TODO: create logic to return the correct API instance based on workload/necessity
		return api[0];
	}

	public static getApiByUrl(url: string): ApiPromise | undefined {
		return this._instancesByUrl.get(url);
	}

	public static getTypeBySpecName(specName: string): string | undefined {
		return this.specNameToTypeMap.getByKey(specName);
	}

	public static getSpecNameByType(type: string): Set<string> | undefined {
		return this.specNameToTypeMap.getByValue(type);
	}

	public static getApiByType(type: string): {
		specName: string;
		api: ApiPromise;
	}[] {
		const specNames = this.specNameToTypeMap.getByValue(type);
		if (!specNames) {
			return [];
		}

		const specNameApis = [];
		for (const specName of specNames) {
			const api = this.getApi(specName);
			if (api) {
				specNameApis.push({ specName, api });
			}
		}

		return specNameApis;
	}

	public static getAllAvailableSpecNames(): string[] {
		return Array.from(this._instancesBySpecName.keys());
	}

	public static clear(): void {
		this._instancesBySpecName.clear();
		this._instancesByUrl.clear();
		this.specNameToTypeMap = new MultiKeyBiMap<string, string>();
		const { logger } = Log;
		logger.info('Cleared API registry');
	}
}
