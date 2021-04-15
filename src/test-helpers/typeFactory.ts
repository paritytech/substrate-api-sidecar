import { ApiPromise, WsProvider } from '@polkadot/api';
import { StorageEntryBase } from '@polkadot/api/types/storage';
import { Metadata } from '@polkadot/metadata';
import { Option, StorageKey, Tuple, TypeRegistry, Vec } from '@polkadot/types';
import {
	Codec,
	CodecArg,
	Constructor,
	InterfaceTypes,
	Registry,
} from '@polkadot/types/types';
import { Observable } from '@polkadot/x-rxjs';

/**
 * Type to fulfill StorageEntryBase regarding storage keys
 */
type GenericStorageEntryFunction = (
	arg1?: CodecArg,
	arg2?: CodecArg
) => Observable<Codec>;

/**
 * Used to create an augmented api for a specific chains metadata. This allows
 * for flexible testing.
 *
 * @param metaData Metadata to be associated with the api augmentation
 */
export function createApiWithAugmentations(
	metaData?: string | Uint8Array
): ApiPromise {
	const registry = new TypeRegistry();
	const metadata = new Metadata(registry, metaData);

	registry.setMetadata(metadata);

	const api = new ApiPromise({
		provider: new WsProvider('ws://', false),
		registry,
	});

	api.injectMetadata(metadata, true);

	return api;
}

/**
 * This Factory facilitates a use for creating types when the registries `createType` method
 * does not suffice.
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
	 * @param index
	 * The id to assign the key to.
	 * @param indexType
	 * The InterfaceType that will be used to create the index into its new appropriate index type
	 * @param storageEntry
	 * Used primarily on QueryableStorageEntry (ie: api.query) within the polkadot api library.
	 * Contains necessary key value pairs to retrieve specific information from a query
	 * such as `at`, `entriesAt`, `entries` etc..
	 *
	 * Some Parameter Examples:
	 * 1. this.api.query.crowdloans.funds
	 * 2. this.api.query.slots.leases
	 */
	storageKey = (
		index: number,
		indexType: keyof InterfaceTypes,
		storageEntry: StorageEntryBase<'promise', GenericStorageEntryFunction>
	): StorageKey => {
		const id = this.#registry.createType(indexType, index);
		const key = new StorageKey(this.#registry, storageEntry.key(id));

		return key.setMeta(storageEntry.creator.meta);
	};

	optionOf = <T extends Codec>(value: T): Option<T> => {
		return new Option<T>(
			this.#registry,
			value.constructor as Constructor<T>,
			value
		);
	};

	vecOf = <T extends Codec>(items: T[]): Vec<T> => {
		const vector = new Vec<T>(
			this.#registry,
			items[0].constructor as Constructor<T>
		);

		vector.push(...items);

		return vector;
	};

	tupleOf = <T extends Codec>(
		value: T[],
		types: (Constructor | keyof InterfaceTypes)[]
	): Tuple => {
		return new Tuple(this.#registry, types, value);
	};
}
