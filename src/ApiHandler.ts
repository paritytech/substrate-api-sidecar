import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces/rpc';

export default class ApiHandler {
	private api: ApiPromise;

	constructor(api: ApiPromise) {
		this.api = api;
	}

	async fetchBlock(hash: BlockHash) {
		const { api } = this;
		const { block } = await api.rpc.chain.getBlock(hash);
		const { parentHash, number, stateRoot, extrinsicsRoot } = block.header;

		const logs = block.header.digest.logs.map((log) => {
			const { type, index, value } = log;

			return { type, index, value };
		});
		const extrinsics = block.extrinsics.map((extrinsic) => {
			const { method, nonce, signature, signer, isSigned, args } = extrinsic;

			return {
				method: `${method.sectionName}.${method.methodName}`,
				signature: isSigned ? { signature, signer } : null,
				nonce,
				args,
			};
		});

		return {
			number,
			hash,
			parentHash,
			stateRoot,
			extrinsicsRoot,
			logs,
			extrinsics,
		};
	}

	async fetchBalance(hash: BlockHash, address: string) {
		const { api } = this;

		const [header, free, reserved, locks] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.balances.freeBalance.at(hash, address),
			api.query.balances.reservedBalance.at(hash, address),
			api.query.balances.locks.at(hash, address),
		]);

		const at = {
			hash,
			height: header.number,
		};

		return { at, free, reserved, locks };
	}
}