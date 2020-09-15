import { Option, Raw } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces';
import { IMetadataCode } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

// https://github.com/shawntabrizi/substrate-graph-benchmarks/blob/ae9b82f/js/extensions/known-keys.js#L21
export const CODE_KEY = '0x3a636f6465';

export class RuntimeCodeService extends AbstractService {
	/**
	 * Fetch `Metadata` in decoded JSON form.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchCode(hash: BlockHash): Promise<IMetadataCode> {
		const { api } = this;

		const [code, { number }] = await Promise.all([
			api.rpc.state.getStorage(CODE_KEY, hash),
			api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				hash,
				height: number.unwrap().toString(10),
			},
			code: code as Option<Raw>,
		};
	}
}
