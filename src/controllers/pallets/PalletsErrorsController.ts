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

import { validateRcAt } from '../../middleware';
import { PalletsErrorsService } from '../../services';
import { IPalletsErrorsParam } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * `/pallets/{palletId}/errors`
 *
 * Returns the metadata for each error item of the pallet.
 *
 * `/pallets/{palletId}/errors/{errorItemId}`
 *
 * Returns the info for the errorItemId.
 *
 * See `docs/src/openapi-v1.yaml` for usage information.
 */
export default class PalletsErrorsController extends AbstractController<PalletsErrorsService> {
	static controllerName = 'PalletsErrors';
	static requiredPallets = [];
	constructor(api: string) {
		super(api, '/pallets/:palletId/errors', new PalletsErrorsService(api));

		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([
			['/:errorItemId', this.getErrorById as RequestHandler],
			['/', this.getErrors],
		]);
	}

	private getErrorById: RequestHandler<IPalletsErrorsParam, unknown, unknown> = async (
		{ query: { at, metadata, rcAt }, params: { palletId, errorItemId } },
		res,
	): Promise<void> => {
		const metadataArg = metadata === 'true';

		if (rcAt) {
			const rcAtResults = await this.getHashFromRcAt(rcAt);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				PalletsErrorsController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockNumber } of rcAtResults) {
				const historicApi = await this.api.at(ahHash);

				const result = await this.service.fetchErrorItem(historicApi, {
					hash: ahHash,
					// stringCamelCase ensures we don't have snake case or kebab case
					palletId: stringCamelCase(palletId),
					errorItemId: stringCamelCase(errorItemId),
					metadata: metadataArg,
				});

				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedResult = {
					...result,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			PalletsErrorsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const historicApi = await this.api.at(hash);

			const result = await this.service.fetchErrorItem(historicApi, {
				hash,
				// stringCamelCase ensures we don't have snake case or kebab case
				palletId: stringCamelCase(palletId),
				errorItemId: stringCamelCase(errorItemId),
				metadata: metadataArg,
			});
			PalletsErrorsController.sanitizedSend(res, result);
		}
	};

	private getErrors: RequestHandler = async (
		{ params: { palletId }, query: { at, onlyIds, rcAt } },
		res,
	): Promise<void> => {
		const onlyIdsArg = onlyIds === 'true';

		if (rcAt) {
			const rcAtResults = await this.getHashFromRcAt(rcAt);

			// Return empty array if no Asset Hub blocks found
			if (rcAtResults.length === 0) {
				PalletsErrorsController.sanitizedSend(res, []);
				return;
			}

			// Process each Asset Hub block found
			const results = [];
			for (const { ahHash, rcBlockNumber } of rcAtResults) {
				const historicApi = await this.api.at(ahHash);

				const result = await this.service.fetchErrors(historicApi, {
					hash: ahHash,
					palletId: stringCamelCase(palletId),
					onlyIds: onlyIdsArg,
				});

				const apiAt = await this.api.at(ahHash);
				const ahTimestamp = await apiAt.query.timestamp.now();

				const enhancedResult = {
					...result,
					rcBlockNumber,
					ahTimestamp: ahTimestamp.toString(),
				};

				results.push(enhancedResult);
			}

			PalletsErrorsController.sanitizedSend(res, results);
		} else {
			const hash = await this.getHashFromAt(at);
			const historicApi = await this.api.at(hash);

			const result = await this.service.fetchErrors(historicApi, {
				hash,
				palletId: stringCamelCase(palletId),
				onlyIds: onlyIdsArg,
			});
			PalletsErrorsController.sanitizedSend(res, result);
		}
	};
}
