import { BlockHash } from '@polkadot/types/interfaces';

import { AbstractService } from '../../AbstractService';

export class ClaimsService extends AbstractService {
	/**
	 * Fetch claims info for an Ethereum address at a given block.
	 *
	 * @param hash `BlockHash` to make query at
	 * @param ethAddress hex encoded public Ethereum address
	 */
	async fetchClaimsInfo(
		hash: BlockHash,
		ethAddress: string
	): Promise<null | { type: string }> {
		const { api } = this;

		const agreementType = await api.query.claims.signing.at(
			hash,
			ethAddress
		);
		if (agreementType.isEmpty) {
			return null;
		}

		return {
			type: agreementType.toString(),
		};
	}
}
