import { ApiPromise, WsProvider } from '@polkadot/api';
import { Metadata } from '@polkadot/metadata';
import { Option, TypeRegistry } from '@polkadot/types';
import { StorageKey, Tuple, Vec } from '@polkadot/types';
import { ParaId } from '@polkadot/types/interfaces';
import { Codec, Constructor, Registry } from '@polkadot/types/types';

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

export class TypeFactory {
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

	public optionOf = <T extends Codec>(value: T): Option<T> => {
		return new Option<T>(
			this.#registry,
			value.constructor as Constructor<T>,
			value
		);
	};

	public vecOf = <T extends Codec>(items: T[]): Vec<T> => {
		const vector = new Vec<T>(
			this.#registry,
			items[0].constructor as Constructor<T>
		);

		vector.push(...items);

		return vector;
	};

	public tupleOf = <T extends Codec>(
		value: T[],
		types: Constructor[]
	): Tuple => {
		return new Tuple(this.#registry, types, value);
	};

	public paraIndex = (index: number): ParaId =>
		this.#registry.createType('ParaId', index);
}
