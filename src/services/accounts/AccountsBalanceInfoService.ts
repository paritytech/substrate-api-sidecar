import { ApiDecoration } from '@polkadot/api/types';
import { Vec } from '@polkadot/types';
import {
	AccountData,
	Balance,
	BalanceLock,
	BlockHash,
	Index,
} from '@polkadot/types/interfaces';
import { BadRequest } from 'http-errors';
import { IAccountBalanceInfo } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class AccountsBalanceInfoService extends AbstractService {
	/**
	 * Fetch balance information for an account at a given block.
	 * N.B. assumes all non native tokens are from ORML tokens pallet.
	 *
	 * @param hash `BlockHash` to make call at.
	 * @param address Address of the account to get the balance info of.
	 * @param token Token to get the balance info of.
	 */
	async fetchAccountBalanceInfo(
		hash: BlockHash,
		historicApi: ApiDecoration<'promise'>,
		address: string,
		token: string
	): Promise<IAccountBalanceInfo> {
		const { api } = this;
		/**
		 * Check two different cases where a historicApi is needed in order
		 * to have the correct runtime methods.
		 *
		 * a) Does the block use the oldest api where the free balance is found
		 * using `historicApi.query.balances.freeBalance`.
		 *
		 * b) Does the block use an older api where the free balance is within the
		 * AccountInfo type, but the storage does not yet have the `.at` method.
		 */
		if (historicApi.query.balances.freeBalance) {
			const [header, free, locks, reserved, nonce] = await Promise.all([
				api.rpc.chain.getHeader(hash),
				historicApi.query.balances.freeBalance(address) as Promise<Balance>,
				historicApi.query.balances.locks(address),
				historicApi.query.balances.reservedBalance(address) as Promise<Balance>,
				historicApi.query.system.accountNonce(address) as Promise<Index>,
			]).catch((err: Error) => {
				throw this.createHttpErrorForAddr(address, err);
			});

			// Values dont exist for these historic runtimes
			const miscFrozen = api.registry.createType('Balance', 0),
				feeFrozen = api.registry.createType('Balance', 0);

			const at = {
				hash,
				height: header.number.toNumber().toString(10),
			};

			if (free) {
				return {
					at,
					nonce,
					tokenSymbol: token,
					free,
					reserved,
					miscFrozen,
					feeFrozen,
					locks,
				};
			} else {
				throw new BadRequest('Account not found');
			}
		} else if (!historicApi.query.system.account.at) {
			const [header, accountInfo, locks] = await Promise.all([
				api.rpc.chain.getHeader(hash),
				historicApi.query.system.account(address),
				historicApi.query.balances.locks(address),
			]).catch((err: Error) => {
				throw this.createHttpErrorForAddr(address, err);
			});

			const {
				data: { free, reserved, feeFrozen, miscFrozen },
				nonce,
			} = accountInfo;

			const at = {
				hash,
				height: header.number.toNumber().toString(10),
			};

			if (accountInfo && locks) {
				return {
					at,
					nonce,
					tokenSymbol: token,
					free,
					reserved,
					miscFrozen,
					feeFrozen,
					locks,
				};
			} else {
				throw new BadRequest('Account not found');
			}
		}

		let locks, header, accountInfo, accountData;
		// We assume the first token is the native token
		if (
			token.toUpperCase() === historicApi.registry.chainTokens[0].toUpperCase()
		) {
			[header, locks, accountInfo] = await Promise.all([
				api.rpc.chain.getHeader(hash),
				historicApi.query.balances.locks(address),
				historicApi.query.system.account(address),
			]).catch((err: Error) => {
				throw this.createHttpErrorForAddr(address, err);
			});

			accountData =
				accountInfo.data != null
					? accountInfo.data
					: await historicApi.query.balances.account(address);
		} else {
			// Assume we are using ORML token pallet
			let locksAny, accountDataAny;
			try {
				[header, locksAny, accountDataAny, accountInfo] = await Promise.all([
					api.rpc.chain.getHeader(hash),
					historicApi.query.tokens.locks(address, { Token: token }),
					historicApi.query.tokens.accounts(address, {
						Token: token,
					}),
					historicApi.query.system.account(address),
				]);
			} catch {
				throw new BadRequest(
					'An error occured while attempting to query for a non-native token; ' +
						'the token specified is likely invalid.'
				);
			}

			// Coerce the ORML query results from polkadot-js generic Codec to exact type
			locks = locksAny as Vec<BalanceLock>;
			accountData = accountDataAny as AccountData;
		}

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		if (accountData && locks && accountInfo) {
			const { free, reserved, miscFrozen, feeFrozen } = accountData;
			const { nonce } = accountInfo;

			return {
				at,
				nonce,
				tokenSymbol: token,
				free,
				reserved,
				miscFrozen,
				feeFrozen,
				locks,
			};
		} else {
			throw new BadRequest('Account not found');
		}
	}
}
