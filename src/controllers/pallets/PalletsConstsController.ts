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

import { stringCamelCase } from '@polkadot/util';
import { RequestHandler } from 'express-serve-static-core';

import { validateUseRcBlock } from '../../middleware';
import { PalletsConstantsService } from '../../services';
import { IPalletsConstantsParam } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * `/pallets/{palletId}/consts`
 *
 * Returns the metadata for each constant item of the pallet.
 *
 * `/pallets/{palletId}/consts/{constantItemId}`
 *
 * Returns the info for the constantItemId.
 *
 * See `docs/src/openapi-v1.yaml` for usage information.
 */
export default class PalletsConstantsController extends AbstractController<PalletsConstantsService> {
	static controllerName = 'PalletsConsts';
	static requiredPallets = [];
	constructor(api: string) {
		super(api, '/pallets/:palletId/consts', new PalletsConstantsService(api));

		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateUseRcBlock);
		this.safeMountAsyncGetHandlers([
			['/:constantItemId', this.getConstById as RequestHandler],
			['/', this.getConsts],
		]);
	}

	private getConstById: RequestHandler<IPalletsConstantsParam, unknown, unknown> = async (
		{ query: { at, metadata, useRcBlock }, params: { palletId, constantItemId } },
		res,
	): Promise<void> => {
		const metadataArg = metadata === 'true';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				PalletsConstantsController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				const historicApi = await this.api.at(ahHash);

				const result = await this.service.fetchConstantItem(historicApi, {
					hash: ahHash,
					// stringCamelCase ensures we don't have snake case or kebab case
					palletId: stringCamelCase(palletId),
					constantItemId: stringCamelCase(constantItemId),
					metadata: metadataArg,
				});

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

			PalletsConstantsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const historicApi = await this.api.at(hash);

			const result = await this.service.fetchConstantItem(historicApi, {
				hash,
				// stringCamelCase ensures we don't have snake case or kebab case
				palletId: stringCamelCase(palletId),
				constantItemId: stringCamelCase(constantItemId),
				metadata: metadataArg,
			});
			PalletsConstantsController.sanitizedSend(res, result);
		}
	};

	private getConsts: RequestHandler = async (
		{ params: { palletId }, query: { at, onlyIds, useRcBlock } },
		res,
	): Promise<void> => {
		const onlyIdsArg = onlyIds === 'true';

		if (useRcBlock === 'true') {
			const rcAtResults = await this.getHashFromRcAt(at);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				PalletsConstantsController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockHash, rcBlockNumber } of rcAtResults) {
				const historicApi = await this.api.at(ahHash);

				const result = await this.service.fetchConstants(historicApi, {
					hash: ahHash,
					palletId: stringCamelCase(palletId),
					onlyIds: onlyIdsArg,
				});

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

			PalletsConstantsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const historicApi = await this.api.at(hash);

			const result = await this.service.fetchConstants(historicApi, {
				hash,
				palletId: stringCamelCase(palletId),
				onlyIds: onlyIdsArg,
			});
			PalletsConstantsController.sanitizedSend(res, result);
		}
	};
}
