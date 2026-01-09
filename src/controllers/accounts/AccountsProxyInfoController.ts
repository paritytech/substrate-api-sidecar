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

import { RequestHandler } from 'express';
import { IAddressParam } from 'src/types/requests';

import { validateAddress, validateUseRcBlock } from '../../middleware';
import { AccountsProxyInfoService } from '../../services';
import AbstractController from '../AbstractController';

export default class AccountsProxyInfoController extends AbstractController<AccountsProxyInfoService> {
	static controllerName = 'AccountsProxyInfo';
	static requiredPallets = [['Proxy']];
	constructor(api: string) {
		super(api, '/accounts/:address/proxy-info', new AccountsProxyInfoService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateAddress, validateUseRcBlock);

		this.safeMountAsyncGetHandlers([['', this.getAccountProxyInfo]]);
	}

	/**
	 * Get the latest account proxy info of `address`.
	 *
	 * @param req Express Request
	 * @param res Express Response
	 */
	private getAccountProxyInfo: RequestHandler<IAddressParam> = async (
		{ params: { address }, query: { at, useRcBlock, useRcBlockFormat } },
		res,
	): Promise<void> => {
		const useObjectFormat = useRcBlockFormat === 'object';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Handle empty results based on format
			if (rcAtResults.length === 0) {
				if (useObjectFormat) {
					const rcBlockInfo = await this.getRcBlockInfo(at);
					AccountsProxyInfoController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, []));
				} else {
					AccountsProxyInfoController.sanitizedSend(res, []);
				}
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchAccountProxyInfo(ahHash, address);

				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedResult = {
					...result,
					rcBlockHash: rcBlockHash.toString(),
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			// Send response based on format
			if (useObjectFormat) {
				const rcBlockInfo = await this.getRcBlockInfo(at);
				AccountsProxyInfoController.sanitizedSend(res, this.formatRcBlockObjectResponse(rcBlockInfo, results));
			} else {
				AccountsProxyInfoController.sanitizedSend(res, results);
			}
		} else {
			const hash = await this.getHashFromAt(at);
			const result = await this.service.fetchAccountProxyInfo(hash, address);
			AccountsProxyInfoController.sanitizedSend(res, result);
		}
	};
}
