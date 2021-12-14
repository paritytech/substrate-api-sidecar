import { ApiPromise, WsProvider } from '@polkadot/api';
import { StorageEntryBase } from '@polkadot/api/types';
import { Metadata } from '@polkadot/types';
import { Option, StorageKey, Tuple, TypeRegistry, Vec } from '@polkadot/types';
import {
	Codec,
	Constructor,
	InterfaceTypes,
	Registry,
} from '@polkadot/types/types';
import { Observable } from '@polkadot/x-rxjs';

/**
 * Type to fulfill StorageEntryBase regarding storage keys
 */
type GenericStorageEntryFunction = (
	arg1?: unknown,
	arg2?: unknown
) => Observable<Codec>;

/**
 * Creates an augmented api with a specific chains metadata. This allows
 * for flexible type creation, which can be useful for testing.
 *
 * @param metadata Metadata to be associated with the api augmentation
 */
export function createApiWithAugmentations(
	metadata?: `0x${string}` | Uint8Array
): ApiPromise {
	const registry = new TypeRegistry();
	const expandedMetadata = new Metadata(registry, metadata);

	registry.setMetadata(expandedMetadata);

	const api = new ApiPromise({
		provider: new WsProvider('ws://', false),
		registry,
	});

	api.injectMetadata(expandedMetadata, true);

	return api;
}

/**
 * Factory for creating polkadot-js `Codec` types. Useful for creating
 * complex types that `createType` cannot accommodate (i.e. creating complex
 * mock data for testing).
 *
 * Ex: <Vec<Option<Tuple<[AccountId, BalanceOf]>>>>
 */
export class TypeFactory {
	readonly #api: ApiPromise;
	readonly #registry: Registry;

	constructor(api: ApiPromise) {
		this.#api = api;
		this.#registry = this.#api.registry;
	}

	/**
	 * @param index The id to assign the key to.
	 * @param indexType The InterfaceType that will be used to create the index into its new appropriate index type
	 * @param storageEntry Used primarily on QueryableStorageEntry (ie: api.query) within the polkadot api library.
	 * Contains necessary key value pairs to retrieve specific information from a query
	 * such as `at`, `entriesAt`, `entries` etc..
	 *
	 * Some Parameter Examples:
	 * 1. apiPromise.query.crowdloans.funds
	 * 2. apiPromise.query.slots.leases
	 */
	storageKey(
		index: number,
		indexType: keyof InterfaceTypes,
		storageEntry: StorageEntryBase<'promise', GenericStorageEntryFunction>
	): StorageKey {
		const id = this.#registry.createType(indexType, index);
		const key = new StorageKey(this.#registry, storageEntry.key(id));

		return key.setMeta(storageEntry.creator.meta);
	}

	optionOf<T extends Codec>(value: T): Option<T> {
		return new Option<T>(
			this.#registry,
			value.constructor as Constructor<T>,
			value
		);
	}

	vecOf<T extends Codec>(items: T[]): Vec<T> {
		const vector = new Vec<T>(
			this.#registry,
			items[0].constructor as Constructor<T>
		);

		vector.push(...items);

		return vector;
	}

	tupleOf<T extends Codec>(
		value: T[],
		types: (Constructor | keyof InterfaceTypes)[]
	): Tuple {
		return new Tuple(this.#registry, types, value);
	}
}
