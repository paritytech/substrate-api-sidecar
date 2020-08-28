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
			{ number },
		] = await Promise.all([
			this.api.rpc.state.getRuntimeVersion(hash),
			this.api.rpc.system.chainType(),
			this.api.rpc.system.properties(),
			this.api.rpc.chain.getHeader(hash),
		]);

		return {
			at: {
				height: number.unwrap().toString(10),
				hash,
			},
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
