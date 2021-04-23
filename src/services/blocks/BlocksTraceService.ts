import { BlockHash } from '@polkadot/types/interfaces';
import { InternalServerError } from 'http-errors';

import { AbstractService } from '../AbstractService';
import { BlockTraceResponse, isBlockTrace, isTraceError, Trace } from './trace';

const DEFAULT_TARGETS = 'pallet,frame,state';
// :extrinsic_index & frame_system::Account
const DEFAULT_KEYS =
	'3a65787472696e7369635f696e646578,26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9';

const UNEXPECTED_RPC_RESPONSE = 'Unexpected response to state_traceBlock RPC';

export class BlocksTraceService extends AbstractService {
	/**
	 * Get the state traces for a block.
	 *
	 * @param hash `BlockHash` to get traces at.
	 */
	async traces(hash: BlockHash): Promise<any> {
		const [{ number }, traceResponse] = await Promise.all([
			this.api.rpc.chain.getHeader(hash),
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			this.api.rpc.state.traceBlock(
				hash,
				DEFAULT_TARGETS,
				DEFAULT_KEYS
			) as Promise<BlockTraceResponse>,
		]);

		if (isTraceError(traceResponse)) {
			throw new InternalServerError(
				`Error: ${JSON.stringify(traceResponse.traceError)}`
			);
		} else if (isBlockTrace(traceResponse)) {
			return {
				at: {
					hash,
					number,
				},
				traces: traceResponse.blockTrace,
			};
		} else {
			throw new InternalServerError(UNEXPECTED_RPC_RESPONSE);
		}
	}

	/**
	 * Get the balance changing operations induced by a block.
	 *
	 * @param hash `BlockHash` to get balance transfer operations at.
	 */
	async operations(hash: BlockHash): Promise<any> {
		const [{ block }, traceResponse] = await Promise.all([
			// Note: this should be getHeader, but the type registry on chain_getBlock is the only
			// one that actually has the historical types
			this.api.rpc.chain.getBlock(hash),
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			this.api.rpc.state.traceBlock(
				hash,
				DEFAULT_TARGETS,
				DEFAULT_KEYS
			) as Promise<BlockTraceResponse>,
		]);

		if (isTraceError(traceResponse)) {
			throw new InternalServerError(
				`Error: ${JSON.stringify(traceResponse.traceError)}`
			);
		} else if (isBlockTrace(traceResponse)) {
			const trace = new Trace(
				this.api,
				traceResponse.blockTrace,
				block.registry
			);

			return {
				at: {
					hash,
					number: block.header.number,
				},
				...trace.operationsAndActions(),
			};
		} else {
			throw new InternalServerError(UNEXPECTED_RPC_RESPONSE);
		}
	}
}
