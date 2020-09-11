import { Metadata } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';

export class RuntimeMetadataService extends AbstractService {
	/**
	 * Fetch `Metadata` in decoded JSON form.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchMetadata(hash: BlockHash): Promise<Metadata> {
		const { api } = this;

		const metadata = await api.rpc.state.getMetadata(hash);

		return metadata;
	}
}
