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

import { ApiDecoration } from '@polkadot/api/types';
import { BlockHash } from '@polkadot/types/interfaces';
import { BlockTrace as PdJsBlockTrace } from '@polkadot/types/interfaces';
import { InternalServerError } from 'http-errors';

import { BlocksTrace, BlocksTraceOperations } from '../../types/responses/BlocksTrace';
import { AbstractService } from '../AbstractService';
import { BlockTrace, StringValues, Trace } from './trace';

/**
 * Substrate tracing targets. These match targets by prefix. To learn more consult
 * the [`Params` section][1] of the RPC docs. These are the same as the defaults
 * for the RPC.
 *
 * [1]: https://github.com/paritytech/substrate/blob/aba876001651506f85c14baf26e006b36092e1a0/client/rpc-api/src/state/mod.rs#L206
 */
const DEFAULT_TARGETS = 'pallet,frame,state';
/**
 * These are the keys we pass as an arg to the RPC to filter events. We will get
 * storage events where they have a key whose prefix matches one of these.
 *
 * Equivalent of the storage keys for :extrinsic_index & frame_system::Account.
 * These are the storage keys we use to filter events to reduce payload size and
 * computational complexity for processing the data. For creating operations we
 * only need events for storage Get/Put to these two storage items.
 *
 * Note: frame_system::Account is the storage prefix for items in the storage map. In the
 * storage events we will get the actual entries of the map and use the key suffix
 * to extract the address.
 * ref: https://github.com/paritytech/substrate/blob/a604906c340c90e22fb20a8d77bcb3fee86c73c1/frame/system/src/lib.rs#L530-L538
 * learn about transparent keys: https://www.shawntabrizi.com/substrate/transparent-keys-in-substrate/
 *
 * Note: :extrinisc_index is the key for a single `u32` value that gets updated
 * during block execution to reflect the index of the current extrinsic being executed.
 * ref: https://github.com/paritytech/substrate/blob/c93ef27486e5f14696e5b6d36edafea7936edbc8/primitives/storage/src/lib.rs#L169
 */
const DEFAULT_KEYS =
	'3a65787472696e7369635f696e646578,26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9';

export class BlocksTraceService extends AbstractService {
	/**
	 * Get the state traces for a block.
	 *
	 * @param hash `BlockHash` to get traces at.
	 */
	async traces(hash: BlockHash): Promise<BlocksTrace> {
		const [{ number }, traceResponse] = await Promise.all([
			this.api.rpc.chain.getHeader(hash),
			this.api.rpc.state.traceBlock(hash, DEFAULT_TARGETS, DEFAULT_KEYS, null),
		]);

		if (traceResponse.isTraceError) {
			throw new InternalServerError(`${traceResponse.asTraceError.toString()}`);
		} else {
			const formattedTrace = BlocksTraceService.formatBlockTrace(traceResponse.asBlockTrace);
			return {
				at: {
					hash,
					height: number.unwrap().toString(10),
				},
				storageKeys: formattedTrace.storageKeys,
				tracingTargets: formattedTrace.tracingTargets,
				events: formattedTrace.events,
				spans: formattedTrace.spans.sort((a, b) => a.id - b.id),
			};
		}
	}

	/**
	 * Get the balance changing operations induced by a block.
	 *
	 * @param hash `BlockHash` to get balance transfer operations at.
	 * @param historicApi ApiDecoration used to retrieve the correct registry
	 * @param includeActions whether or not to include `actions` field in the response.
	 */
	async operations(
		hash: BlockHash,
		historicApi: ApiDecoration<'promise'>,
		includeActions: boolean,
	): Promise<BlocksTraceOperations> {
		const [{ block }, traceResponse] = await Promise.all([
			// Note: this should be getHeader, but the type registry on chain_getBlock is the only
			// one that actually has the historical types. https://github.com/polkadot-js/api/issues/3487
			this.api.rpc.chain.getBlock(hash),
			this.api.rpc.state.traceBlock(hash, DEFAULT_TARGETS, DEFAULT_KEYS, null),
		]);

		if (traceResponse.isTraceError) {
			throw new InternalServerError(`${traceResponse.asTraceError.toString()}`);
		} else {
			const trace = new Trace(
				this.api,
				BlocksTraceService.formatBlockTrace(traceResponse.asBlockTrace),
				historicApi.registry,
			);

			const { operations, actions } = trace.actionsAndOps();

			return {
				at: {
					hash,
					height: block.header.number.unwrap().toString(10),
				},
				operations,
				actions: includeActions ? actions : undefined,
			};
		}
	}

	/**
	 * Format the response to the `traceBlock` RPC. Primarily used to normalize data
	 * for `Trace`. This essentially should return something that closesly resembles
	 * the raw RPC JSON response result.
	 *
	 * @param blockTrace Polkadot-js BlockTrace
	 */
	private static formatBlockTrace(blockTrace: PdJsBlockTrace): BlockTrace {
		const events = blockTrace.events.map(({ parentId, target, data: { stringValues } }) => {
			const formattedStringValues = [...stringValues.entries()].reduce((acc, [k, v]) => {
				acc[k.toString()] = v.toString();

				return acc;
			}, {} as StringValues);

			return {
				parentId: parentId.isSome ? parentId.unwrap().toNumber() : null,
				target: target.toString(),
				data: {
					stringValues: formattedStringValues,
				},
			};
		});

		const spans = blockTrace.spans.map(({ id, name, parentId, target, wasm }) => {
			return {
				id: id.toNumber(),
				parentId: parentId.isSome ? parentId.unwrap().toNumber() : null,
				name: name.toString(),
				target: target.toString(),
				wasm: wasm.toJSON(),
			};
		});

		return {
			storageKeys: blockTrace.storageKeys.toString(),
			tracingTargets: blockTrace.tracingTargets.toString(),
			events,
			spans,
		};
	}
}
