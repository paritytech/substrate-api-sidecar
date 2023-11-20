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
import { IPalletsEventsParam } from 'src/types/requests';

import { PalletsEventsService } from '../../services';
import AbstractController from '../AbstractController';

export default class PalletsEventsController extends AbstractController<PalletsEventsService> {
	constructor(api: ApiPromise) {
		super(api, '/pallets/:palletId/events', new PalletsEventsService(api));

		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:eventItemId', this.getEventById as RequestHandler],
			['/', this.getEvents],
		]);
	}

	private getEventById: RequestHandler<IPalletsEventsParam, unknown, unknown> = async (
		{ query: { at, metadata }, params: { palletId, eventItemId } },
		res,
	): Promise<void> => {
		const metadataArg = metadata === 'true';
		const hash = await this.getHashFromAt(at);
		const historicApi = await this.api.at(hash);

		PalletsEventsController.sanitizedSend(
			res,
			await this.service.fetchEventItem(historicApi, {
				hash,
				// stringCamelCase ensures we don't have snake case or kebab case
				palletId: stringCamelCase(palletId),
				eventItemId: stringCamelCase(eventItemId),
				metadata: metadataArg,
			}),
		);
	};

	private getEvents: RequestHandler = async ({ params: { palletId }, query: { at, onlyIds } }, res): Promise<void> => {
		const onlyIdsArg = onlyIds === 'true';
		const hash = await this.getHashFromAt(at);
		const historicApi = await this.api.at(hash);

		PalletsEventsController.sanitizedSend(
			res,
			await this.service.fetchEvents(historicApi, {
				hash,
				palletId: stringCamelCase(palletId),
				onlyIds: onlyIdsArg,
			}),
		);
	};
}
