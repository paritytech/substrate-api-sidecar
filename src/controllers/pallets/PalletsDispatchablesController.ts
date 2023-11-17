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

import { ApiPromise } from '@polkadot/api';
import { stringCamelCase } from '@polkadot/util';
import { RequestHandler } from 'express-serve-static-core';

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
	constructor(api: ApiPromise) {
		super(api, '/pallets/:palletId/dispatchables', new PalletsDispatchablesService(api));

		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:dispatchableItemId', this.getDispatchableById as RequestHandler],
			['/', this.getDispatchables],
		]);
	}

	/**
	 * Note: the `at` parameter is not provided because the call for dispatchables does not exist on the historicApi currently.
	 * Support may be added for this in a future update.
	 */
	private getDispatchableById: RequestHandler<IPalletsDispatchablesParam, unknown, unknown> = async (
		{ query: { metadata }, params: { palletId, dispatchableItemId } },
		res,
	): Promise<void> => {
		const at = undefined;
		const hash = await this.getHashFromAt(at);
		const metadataArg = metadata === 'true';
		const historicApi = await this.api.at(hash);

		PalletsDispatchablesController.sanitizedSend(
			res,
			await this.service.fetchDispatchableItem(historicApi, {
				hash,
				// stringCamelCase ensures we don't have snake case or kebab case
				palletId: stringCamelCase(palletId),
				dispatchableItemId: stringCamelCase(dispatchableItemId),
				metadata: metadataArg,
			}),
		);
	};

	/**
	 * Note: the `at` parameter is not provided because the call for dispatchables does not exist on the historicApi currently.
	 * Support may be added for this in a future update.
	 */
	private getDispatchables: RequestHandler = async (
		{ params: { palletId }, query: { onlyIds } },
		res,
	): Promise<void> => {
		const at = undefined;
		const hash = await this.getHashFromAt(at);
		const onlyIdsArg = onlyIds === 'true';
		const historicApi = await this.api.at(hash);

		PalletsDispatchablesController.sanitizedSend(
			res,
			await this.service.fetchDispatchables(historicApi, {
				hash,
				palletId: stringCamelCase(palletId),
				onlyIds: onlyIdsArg,
			}),
		);
	};
}
