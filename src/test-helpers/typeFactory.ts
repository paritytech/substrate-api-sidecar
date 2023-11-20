// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

import { ApiPromise } from '@polkadot/api';
import { StorageEntryBase } from '@polkadot/api/types';
import { WsProvider } from '@polkadot/rpc-provider/ws';
import { Metadata } from '@polkadot/types';
import { Option, StorageKey, Tuple, TypeRegistry, Vec } from '@polkadot/types';
import { AnyJson, Codec, CodecClass, InterfaceTypes, Registry } from '@polkadot/types/types';
import { Observable } from 'rxjs';

jest.mock('@polkadot/rpc-provider/ws'); // WsProvider is now a mock constructor

/**
 * Type to fulfill StorageEntryBase regarding storage keys
 */
type GenericStorageEntryFunction = (arg1?: unknown, arg2?: unknown) => Observable<Codec>;

/**
 * Creates an augmented api with a specific chains metadata. This allows
 * for flexible type creation, which can be useful for testing.
 *
 * @param metadata Metadata to be associated with the api augmentation
 */
export function createApiWithAugmentations(metadata?: `0x${string}` | Uint8Array): ApiPromise {
	const registry = new TypeRegistry();
	const expandedMetadata = new Metadata(registry, metadata);
	const WsProviderMock = WsProvider as jest.MockedClass<typeof WsProvider>;
	const provider = new WsProviderMock();

	registry.setMetadata(expandedMetadata);

	const api = new ApiPromise({
		provider,
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
		index: number | string,
		indexType: keyof InterfaceTypes,
		storageEntry: StorageEntryBase<'promise', GenericStorageEntryFunction>,
	): StorageKey {
		const id = this.#registry.createType(indexType, index);
		const key = new StorageKey(this.#registry, storageEntry.key(id));

		return key.setMeta(storageEntry.creator.meta);
	}

	storageKeyMultilocation(
		index: AnyJson,
		indexType: string,
		storageEntry: StorageEntryBase<'promise', GenericStorageEntryFunction>,
	): StorageKey {
		const foreignAssetMultiLocationStr = JSON.stringify(index).replace(/(\d),/g, '$1');

		const id = this.#registry.createType(indexType, JSON.parse(foreignAssetMultiLocationStr));
		const key = new StorageKey(this.#registry, storageEntry.key(id));

		return key.setMeta(storageEntry.creator.meta);
	}

	optionOf<T extends Codec>(value: T): Option<T> {
		return new Option<T>(this.#registry, value.constructor as CodecClass<T>, value);
	}

	vecOf<T extends Codec>(items: T[]): Vec<T> {
		const vector = new Vec<T>(this.#registry, items[0].constructor as CodecClass<T>);

		vector.push(...items);

		return vector;
	}

	tupleOf<T extends Codec>(value: T[], types: (CodecClass | keyof InterfaceTypes)[]): Tuple {
		return new Tuple(this.#registry, types, value);
	}
}
