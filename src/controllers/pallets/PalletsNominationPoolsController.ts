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

import { validateUseRcBlock } from '../../middleware';
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
		this.router.use(this.path, validateUseRcBlock);
		this.safeMountAsyncGetHandlers([
			['/info', this.getNominationPoolInfo],
			['/:poolId', this.getNominationPoolById],
		]);
	}

	private getNominationPoolById: RequestHandler = async (
		{ params: { poolId }, query: { at, useRcBlock, metadata } },
		res,
	): Promise<void> => {
		/**
		 * Verify our param `poolId` is an integer represented as a string, and return
		 * it as an integer
		 */
		const index = this.parseNumberOrThrow(poolId, '`poolId` path param is not a number');

		const metadataArg = metadata === 'true';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				PalletsNominationPoolController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchNominationPoolById(index, ahHash, metadataArg);

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

			PalletsNominationPoolController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const result = await this.service.fetchNominationPoolById(index, hash, metadataArg);
			PalletsNominationPoolController.sanitizedSend(res, result);
		}
	};

	private getNominationPoolInfo: RequestHandler = async ({ query: { at, useRcBlock } }, res): Promise<void> => {
		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				PalletsNominationPoolController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				const result = await this.service.fetchNominationPoolInfo(ahHash);

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

			PalletsNominationPoolController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const result = await this.service.fetchNominationPoolInfo(hash);
			PalletsNominationPoolController.sanitizedSend(res, result);
		}
	};
}
