import { ApiPromise, WsProvider } from '@polkadot/api';
import { Metadata } from '@polkadot/metadata';
import { TypeRegistry } from '@polkadot/types';
import { StorageKey } from '@polkadot/types';
import { ParaId } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';

// import metaStatic from '@polkadot/metadata/static';
import { rococoMetadataV228 } from './metadata/rococoMetadata';

export function createApiWithAugmentations(): ApiPromise {
	const registry = new TypeRegistry();
	const metadata = new Metadata(registry, rococoMetadataV228);

	registry.setMetadata(metadata);

	const api = new ApiPromise({
		provider: new WsProvider('ws://', false),
		registry,
	});

	api.injectMetadata(metadata, true);

	return api;
}

export class CrowdloanFactory {
	readonly #api: ApiPromise;
	readonly #registry: Registry;

	constructor(api: ApiPromise) {
		this.#api = api;
		this.#registry = this.#api.registry;
	}

	public storageKey = (index: number): StorageKey => {
		const key = new StorageKey(
			this.#registry,
			this.#api.query.crowdloan.funds.key(this.paraIndex(index))
		);

		return key.setMeta(this.#api.query.crowdloan.funds.creator.meta);
	};

	public paraIndex = (index: number): ParaId =>
		this.#registry.createType('ParaId', index);
}
