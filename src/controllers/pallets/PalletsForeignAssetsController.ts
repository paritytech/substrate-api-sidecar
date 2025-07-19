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

import { BlockHash } from '@polkadot/types/interfaces';
import { RequestHandler } from 'express';

import { validateRcAt } from '../../middleware';
import { PalletsForeignAssetsService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET asset information for all foreign assets.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 *  	identifier, as the block height or block hash. Defaults to most recent block.
 * - (Optional)`rcAt`: Relay chain block at which to retrieve Asset Hub foreign assets info. Only supported
 * 		for Asset Hub endpoints. Cannot be used with 'at' parameter.
 *
 * `/pallets/foreign-assets`
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `items`: An array containing the `AssetDetails` and `AssetMetadata` of every foreign asset.
 * - `rcBlockNumber`: The relay chain block number used for the query. Only present when `rcAt` parameter is used.
 * - `ahTimestamp`: The Asset Hub block timestamp. Only present when `rcAt` parameter is used.
 *
 * Substrate References:
 * - Foreign Assets Pallet Instance in Kusama Asset Hub: https://github.com/paritytech/cumulus/blob/master/parachains/runtimes/assets/asset-hub-kusama/src/lib.rs#L295
 */
export default class PalletsForeignAssetsController extends AbstractController<PalletsForeignAssetsService> {
	static controllerName = 'PalletsForeignAssets';
	static requiredPallets = [['ForeignAssets']];
	constructor(api: string) {
		super(api, '/pallets/foreign-assets', new PalletsForeignAssetsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([['', this.getForeignAssets]]);
	}

	private getForeignAssets: RequestHandler = async ({ query: { at, rcAt } }, res): Promise<void> => {
		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const result = await this.service.fetchForeignAssets(hash);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsForeignAssetsController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsForeignAssetsController.sanitizedSend(res, result);
		}
	};
}
