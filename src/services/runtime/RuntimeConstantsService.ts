//import { Option, Raw } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces';
import { decorateConstants } from '@polkadot/types/metadata';
import { IConstants } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class RuntimeConstantsService extends AbstractService {
	/**
	 * Fetch constants in decoded JSON form.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchConstants(hash: BlockHash): Promise<IConstants> {
		const { api } = this;

		const [metadata, { number }] = await Promise.all([
			api.rpc.state.getMetadata(hash),
			api.rpc.chain.getHeader(hash),
		]);

		const registry = api.registry;

		return {
			consts: decorateConstants(registry, metadata.asLatest, metadata.version),
			at: {
				height: number.unwrap().toString(10),
				hash,
			},
		};
	}
}
