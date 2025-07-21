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
import { PalletsNominationPoolService } from '../../services';
import AbstractController from '../AbstractController';

export default class PalletsNominationPoolController extends AbstractController<PalletsNominationPoolService> {
	static controllerName = 'PalletsNominationPools';
	static requiredPallets = [['NominationPools']];
	constructor(api: string) {
		super(api, '/pallets/nomination-pools', new PalletsNominationPoolService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([
			['/info', this.getNominationPoolInfo],
			['/:poolId', this.getNominationPoolById],
		]);
	}

	private getNominationPoolById: RequestHandler = async (
		{ params: { poolId }, query: { at, rcAt, metadata } },
		res,
	): Promise<void> => {
		/**
		 * Verify our param `poolId` is an integer represented as a string, and return
		 * it as an integer
		 */
		const index = this.parseNumberOrThrow(poolId, '`poolId` path param is not a number');

		const metadataArg = metadata === 'true';

		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const result = await this.service.fetchNominationPoolById(index, hash, metadataArg);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsNominationPoolController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsNominationPoolController.sanitizedSend(res, result);
		}
	};

	private getNominationPoolInfo: RequestHandler = async ({ query: { at, rcAt } }, res): Promise<void> => {
		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const result = await this.service.fetchNominationPoolInfo(hash);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsNominationPoolController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsNominationPoolController.sanitizedSend(res, result);
		}
	};
}
