/* eslint-disable @typescript-eslint/no-var-requires */
import { ApiPromise } from '@polkadot/api';
import { HttpProvider, WsProvider } from '@polkadot/rpc-provider';
import { OverrideBundleType, RegistryTypes } from '@polkadot/types/types';

import tempTypesBundle from '../override-types/typesBundle';
import { SidecarConfig } from '../SidecarConfig';

export class ApiPromiseRegistry {
	// instances of ApiPromise for each defined URL
	private static _instancesBySpecName: Map<string, ApiPromise> = new Map();

	/**
	 * Get the ApiPromise instance for the given spec name.
	 * @param specName The spec name to get the ApiPromise instance for.
	 * @returns The ApiPromise instance for the given spec name.
	 */

	public static async initApi(url: string): Promise<ApiPromise> {
		if (!this._instancesBySpecName.has(url)) {
			const { config } = SidecarConfig;

			const { TYPES_BUNDLE, TYPES_SPEC, TYPES_CHAIN, TYPES, CACHE_CAPACITY } = config.SUBSTRATE;
			// Instantiate new API Promise instance
			const api = await ApiPromise.create({
				provider: url.startsWith('http')
					? new HttpProvider(url, undefined, CACHE_CAPACITY || 0)
					: new WsProvider(url, undefined, undefined, undefined, CACHE_CAPACITY || 0),
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

			this._instancesBySpecName.set(specName.toString(), api);
		}

		return this.getApi(url)!;
	}

	public static getApi(specName: string): ApiPromise | undefined {
		return this._instancesBySpecName.get(specName);
	}
}
