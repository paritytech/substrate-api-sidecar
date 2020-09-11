import { BlockHash } from '@polkadot/types/interfaces';
import { IAccountBalanceInfo } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class AccountsBalanceInfoService extends AbstractService {
	/**
	 * Fetch balance information for an account at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address address of the account to get the balance info of
	 */
	async fetchAccountBalanceInfo(
		hash: BlockHash,
		address: string
	): Promise<IAccountBalanceInfo> {
		const { api } = this;

		const [header, locks, sysAccount] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.balances.locks.at(hash, address),
			api.query.system.account.at(hash, address),
		]);

		const account =
			sysAccount.data != null
				? sysAccount.data
				: await api.query.balances.account.at(hash, address);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		if (account && locks && sysAccount) {
			const { free, reserved, miscFrozen, feeFrozen } = account;
			const { nonce } = sysAccount;

			return {
				at,
				nonce,
				free,
				reserved,
				miscFrozen,
				feeFrozen,
				locks,
			};
		} else {
			throw {
				at,
				error: 'Account not found',
			};
		}
	}
}
