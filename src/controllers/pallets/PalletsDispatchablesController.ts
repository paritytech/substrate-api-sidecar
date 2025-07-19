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
import { stringCamelCase } from '@polkadot/util';
import { RequestHandler } from 'express-serve-static-core';

import { validateRcAt } from '../../middleware';
import { PalletsDispatchablesService } from '../../services';
import { IPalletsDispatchablesParam } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * `/pallets/{palletId}/dispatchables`
 *
 * Returns the metadata for each dispatchable item of the pallet.
 *
 * `/pallets/{palletId}/dispatchables/{dispatchableItemId}`
 *
 * Returns the info for the dispatchableItemId.
 *
 * See `docs/src/openapi-v1.yaml` for usage information.
 */
export default class PalletsDispatchablesController extends AbstractController<PalletsDispatchablesService> {
	static controllerName = 'PalletsDispatchables';
	static requiredPallets = [];
	constructor(api: string) {
		super(api, '/pallets/:palletId/dispatchables', new PalletsDispatchablesService(api));

		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([
			['/:dispatchableItemId', this.getDispatchableById as RequestHandler],
			['/', this.getDispatchables],
		]);
	}

	private getDispatchableById: RequestHandler<IPalletsDispatchablesParam, unknown, unknown> = async (
		{ query: { metadata, at, rcAt }, params: { palletId, dispatchableItemId } },
		res,
	): Promise<void> => {
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

		const historicApi = await this.api.at(hash);

		const result = await this.service.fetchDispatchableItem(historicApi, {
			hash,
			// stringCamelCase ensures we don't have snake case or kebab case
			palletId: stringCamelCase(palletId),
			dispatchableItemId: stringCamelCase(dispatchableItemId),
			metadata: metadataArg,
		});

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsDispatchablesController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsDispatchablesController.sanitizedSend(res, result);
		}
	};

	private getDispatchables: RequestHandler = async (
		{ params: { palletId }, query: { onlyIds, at, rcAt } },
		res,
	): Promise<void> => {
		const onlyIdsArg = onlyIds === 'true';
		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const historicApi = await this.api.at(hash);

		const result = await this.service.fetchDispatchables(historicApi, {
			hash,
			palletId: stringCamelCase(palletId),
			onlyIds: onlyIdsArg,
		});

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsDispatchablesController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsDispatchablesController.sanitizedSend(res, result);
		}
	};
}
