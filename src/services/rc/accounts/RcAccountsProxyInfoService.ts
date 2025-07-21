// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import type { ApiPromise } from '@polkadot/api';
import type { ApiDecoration } from '@polkadot/api/types';
import type { BlockHash } from '@polkadot/types/interfaces';

import type { AccountsProxyInfo } from '../../../types/responses';
import { AbstractService } from '../../AbstractService';

export class RcAccountsProxyInfoService extends AbstractService {
	/**
	 * Fetch proxy information for an account from the relay chain at a given block.
	 *
	 * @param hash `BlockHash` to make call at.
	 * @param api Relay chain API instance.
	 * @param historicApi Historic API instance for the relay chain.
	 * @param address Address of the account to get the proxy info of.
	 */
	async fetchAccountProxyInfo(
		hash: BlockHash,
		api: ApiPromise,
		historicApi: ApiDecoration<'promise'>,
		address: string,
	): Promise<AccountsProxyInfo> {
		const [{ number }, proxyInfo] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.proxy.proxies(address),
		]);

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			delegatedAccounts: proxyInfo[0],
			depositHeld: proxyInfo[1],
		};
	}
}
