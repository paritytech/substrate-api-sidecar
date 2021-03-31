import { BlockHash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';

export class ParasService extends AbstractService {
	async leaseInfo(hash: BlockHash, paraId: number): Promise<any> {
		const [leases] = await Promise.all([
			this.api.query.slots.leases.at(hash, paraId),
		]);

		return leases;
	}
}
