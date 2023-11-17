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
	constructor(api: ApiPromise) {
		super(api, '/pallets/:palletId/consts', new PalletsConstantsService(api));

		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:constantItemId', this.getConstById as RequestHandler],
			['/', this.getConsts],
		]);
	}

	private getConstById: RequestHandler<IPalletsConstantsParam, unknown, unknown> = async (
		{ query: { at, metadata }, params: { palletId, constantItemId } },
		res,
	): Promise<void> => {
		const metadataArg = metadata === 'true';
		const hash = await this.getHashFromAt(at);
		const historicApi = await this.api.at(hash);

		PalletsConstantsController.sanitizedSend(
			res,
			await this.service.fetchConstantItem(historicApi, {
				hash,
				// stringCamelCase ensures we don't have snake case or kebab case
				palletId: stringCamelCase(palletId),
				constantItemId: stringCamelCase(constantItemId),
				metadata: metadataArg,
			}),
		);
	};

	private getConsts: RequestHandler = async ({ params: { palletId }, query: { at, onlyIds } }, res): Promise<void> => {
		const onlyIdsArg = onlyIds === 'true';
		const hash = await this.getHashFromAt(at);
		const historicApi = await this.api.at(hash);

		PalletsConstantsController.sanitizedSend(
			res,
			await this.service.fetchConstants(historicApi, {
				hash,
				palletId: stringCamelCase(palletId),
				onlyIds: onlyIdsArg,
			}),
		);
	};
}
