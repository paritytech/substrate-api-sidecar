// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ApiDecoration } from '@polkadot/api/types';
import { Vec } from '@polkadot/types';
import { AccountData, Balance, BalanceLock, BlockHash, Index } from '@polkadot/types/interfaces';
import { PalletBalancesAccountData } from '@polkadot/types/lookup';
import { BadRequest } from 'http-errors';

import { IAccountBalanceInfo, IBalanceLock } from '../../types/responses';
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
		token: string,
		denominate: boolean,
	): Promise<IAccountBalanceInfo> {
		const { api } = this;

		if (denominate && historicApi.registry.chainDecimals.length === 0) {
			throw new BadRequest(
				"Invalid use of the query parameter `denominated`. This chain doesn't have a valid chain decimal to denominate a value.",
			);
		}

		const capitalizeTokens = historicApi.registry.chainTokens.map((token) => token.toUpperCase());
		const tokenIdx = capitalizeTokens.indexOf(token);
		const decimal = historicApi.registry.chainDecimals[tokenIdx];
		/**
		 * Check two different cases where a historicApi is needed in order
		 * to have the correct runtime methods.
		 *
		 * a) Does the block use the oldest api where the free balance is found
		 * using `historicApi.query.balances.freeBalance`.
		 *
		 * b) Does the block use an older api where the free balance is within the
		 * AccountInfo type, but the storage does not yet have the `.at` method.
		 *
		 * NOTE: This PR also checks to see if `frozen` exists or `miscFrozen` and `feeFrozen`.
		 * There was a breaking change in https://github.com/paritytech/substrate/pull/12951 which
		 * changed the format of the Account Data returned by the chain.
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

			const at = {
				hash,
				height: header.number.toNumber().toString(10),
			};

			if (free) {
				return {
					at,
					nonce,
					tokenSymbol: token,
					free: this.inDenominationBal(denominate, free, decimal),
					reserved: this.inDenominationBal(denominate, reserved, decimal),
					miscFrozen: 'miscFrozen does not exist for this runtime',
					feeFrozen: 'feeFrozen does not exist for this runtime',
					frozen: 'frozen does not exist for this runtime',
					locks: this.inDenominationLocks(denominate, locks, decimal),
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

			const { data, nonce } = accountInfo;

			let free, reserved, feeFrozen, miscFrozen, frozen;
			if (accountInfo.data?.frozen) {
				free = data.free;
				reserved = data.reserved;
				frozen = data.frozen;
				miscFrozen = 'miscFrozen does not exist for this runtime';
				feeFrozen = 'feeFrozen does not exist for this runtime';
			} else {
				const tmpData = data as unknown as AccountData;
				free = tmpData.free;
				reserved = tmpData.reserved;
				feeFrozen = tmpData.feeFrozen;
				miscFrozen = tmpData.miscFrozen;
				frozen = 'frozen does not exist for this runtime';
			}

			const at = {
				hash,
				height: header.number.toNumber().toString(10),
			};

			if (accountInfo && locks) {
				return {
					at,
					nonce,
					tokenSymbol: token,
					free: this.inDenominationBal(denominate, free, decimal),
					reserved: this.inDenominationBal(denominate, reserved, decimal),
					miscFrozen:
						typeof miscFrozen === 'string' ? miscFrozen : this.inDenominationBal(denominate, miscFrozen, decimal),
					feeFrozen: typeof feeFrozen === 'string' ? feeFrozen : this.inDenominationBal(denominate, feeFrozen, decimal),
					frozen: typeof frozen === 'string' ? frozen : this.inDenominationBal(denominate, frozen, decimal),
					locks: this.inDenominationLocks(denominate, locks, decimal),
				};
			} else {
				throw new BadRequest('Account not found');
			}
		}

		let locks, header, accountInfo, accountData;
		// We assume the first token is the native token
		if (token.toUpperCase() === historicApi.registry.chainTokens[0].toUpperCase()) {
			[header, locks, accountInfo] = await Promise.all([
				api.rpc.chain.getHeader(hash),
				historicApi.query.balances.locks(address),
				historicApi.query.system.account(address),
			]).catch((err: Error) => {
				throw this.createHttpErrorForAddr(address, err);
			});

			accountData = accountInfo.data != null ? accountInfo.data : await historicApi.query.balances.account(address);
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
						'the token specified is likely invalid.',
				);
			}

			// Coerce the ORML query results from polkadot-js generic Codec to exact type
			locks = locksAny as Vec<BalanceLock>;
			accountData = accountDataAny;
		}

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		if (accountData && locks && accountInfo) {
			const { nonce } = accountInfo;
			let free, reserved, feeFrozen, miscFrozen, frozen;
			if ((accountData as AccountData).miscFrozen) {
				const tmpData = accountData as AccountData;
				free = tmpData.free;
				reserved = tmpData.reserved;
				feeFrozen = tmpData.feeFrozen;
				miscFrozen = tmpData.miscFrozen;
				frozen = 'frozen does not exist for this runtime';
			} else {
				const tmpData = accountData as PalletBalancesAccountData;
				free = tmpData.free;
				reserved = tmpData.reserved;
				frozen = tmpData.frozen;
				feeFrozen = 'feeFrozen does not exist for this runtime';
				miscFrozen = 'miscFrozen does not exist for this runtime';
			}

			return {
				at,
				nonce,
				tokenSymbol: token,
				free: this.inDenominationBal(denominate, free, decimal),
				reserved: this.inDenominationBal(denominate, reserved, decimal),
				miscFrozen:
					typeof miscFrozen === 'string' ? miscFrozen : this.inDenominationBal(denominate, miscFrozen, decimal),
				feeFrozen: typeof feeFrozen === 'string' ? feeFrozen : this.inDenominationBal(denominate, feeFrozen, decimal),
				frozen: typeof frozen === 'string' ? frozen : this.inDenominationBal(denominate, frozen, decimal),
				locks: this.inDenominationLocks(denominate, locks, decimal),
			};
		} else {
			throw new BadRequest('Account not found');
		}
	}

	/**
	 * Apply a denomination to a balance depending on the chains decimal value.
	 *
	 * @param balance free balance available encoded as Balance. This will be
	 * represented as an atomic value.
	 * @param dec The chains given decimal token value. It must be > 0, and it
	 * is applied to the given atomic value given by the `balance`.
	 */
	private applyDenominationBalance(balance: Balance, dec: number): string {
		const strBalance = balance.toString();

		// We dont want to denominate a zero balance or zero decimal
		if (strBalance === '0' || dec === 0) {
			return strBalance;
		}
		// If the denominated value will be less then zero, pad it correctly
		if (strBalance.length <= dec) {
			return '.'.padEnd(dec - strBalance.length + 1, '0').concat(strBalance);
		}

		const lenDiff = strBalance.length - dec;
		return strBalance.substring(0, lenDiff) + '.' + strBalance.substring(lenDiff, strBalance.length);
	}

	/**
	 * Parse and denominate the `amount` key in each BalanceLock
	 *
	 * @param locks A vector containing BalanceLock objects
	 * @param dec The chains given decimal value
	 */
	private applyDenominationLocks(locks: Vec<BalanceLock>, dec: number): IBalanceLock[] {
		return locks.map((lock) => {
			return {
				id: lock.id,
				amount: this.applyDenominationBalance(lock.amount, dec),
				reasons: lock.reasons,
			};
		});
	}

	/**
	 * Either denominate a value, or return the original Balance as an atomic value.
	 *
	 * @param denominate Boolean to determine whether or not we denominate a balance
	 * @param bal Inputted Balance
	 * @param dec Decimal value used to denominate a Balance
	 */
	private inDenominationBal(denominate: boolean, bal: Balance, dec: number): Balance | string {
		return denominate ? this.applyDenominationBalance(bal, dec) : bal;
	}

	/**
	 * Either denominate the Balance's within Locks or return the original Locks.
	 *
	 * @param denominate Boolean to determine whether or not we denominate a balance
	 * @param locks Inputted Vec<BalanceLock>, only the amount key will be denominated
	 * @param dec Decimal value used to denominate a Balance
	 */
	private inDenominationLocks(
		denominate: boolean,
		locks: Vec<BalanceLock>,
		dec: number,
	): Vec<BalanceLock> | IBalanceLock[] {
		return denominate ? this.applyDenominationLocks(locks, dec) : locks;
	}
}
