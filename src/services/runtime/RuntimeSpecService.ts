import { BlockHash } from '@polkadot/types/interfaces';
import { IRuntimeSpec } from 'src/types/responses';

import { AbstractService } from '../AbstractService';
export class RuntimeSpecService extends AbstractService {
	async fetchSpec(hash: BlockHash): Promise<IRuntimeSpec> {
		const [
			{
				authoringVersion,
				specName,
				specVersion,
				transactionVersion,
				implVersion,
			},
			chainType,
			properties,
		] = await Promise.all([
			this.api.rpc.state.getRuntimeVersion(hash),
			this.api.rpc.system.chainType(),
			this.api.rpc.system.properties(),
		]);

		return {
			authoringVersion,
			transactionVersion,
			implVersion,
			specName,
			specVersion,
			chainType,
			properties,
		};
	}
}
