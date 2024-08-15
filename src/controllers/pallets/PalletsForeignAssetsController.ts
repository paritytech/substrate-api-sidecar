// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { PalletsForeignAssetsService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET asset information for all foreign assets.
 *
 * Query:
 * - (Optional)`at`: Block at which to retrieve runtime version information at. Block
 *  	identifier, as the block height or block hash. Defaults to most recent block.
 *
 * `/pallets/foreign-assets`
 * Returns:
 * - `at`: Block number and hash at which the call was made.
 * - `items`: An array containing the `AssetDetails` and `AssetMetadata` of every foreign asset.
 *
 * Substrate References:
 * - Foreign Assets Pallet Instance in Kusama Asset Hub: https://github.com/paritytech/cumulus/blob/master/parachains/runtimes/assets/asset-hub-kusama/src/lib.rs#L295
 */
export default class PalletsForeignAssetsController extends AbstractController<PalletsForeignAssetsService> {
	constructor(api: ApiPromise) {
		super(api, '/pallets/foreign-assets', new PalletsForeignAssetsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getForeignAssets]]);
	}

	private getForeignAssets: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const hash = await this.getHashFromAt(at);
		PalletsForeignAssetsController.sanitizedSend(res, await this.service.fetchForeignAssets(hash));
	};
}
