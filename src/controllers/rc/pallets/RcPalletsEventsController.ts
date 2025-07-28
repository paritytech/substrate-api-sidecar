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
import { IPalletsEventsParam } from 'src/types/requests';

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { PalletsEventsService } from '../../../services';
import AbstractController from '../../AbstractController';

export default class RcPalletsEventsController extends AbstractController<PalletsEventsService> {
	static controllerName = 'RcPalletsEvents';
	static requiredPallets = [];
	constructor(_api: string) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(rcSpecName, '/rc/pallets/:palletId/events', new PalletsEventsService(rcSpecName));
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
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const metadataArg = metadata === 'true';
		const hash = await this.getHashFromAt(at, { api: rcApi });
		const historicApi = await rcApi.at(hash);

		const result = await this.service.fetchEventItem(historicApi, {
			hash,
			palletId: stringCamelCase(palletId),
			eventItemId: stringCamelCase(eventItemId),
			metadata: metadataArg,
		});
		RcPalletsEventsController.sanitizedSend(res, result);
	};

	private getEvents: RequestHandler = async ({ params: { palletId }, query: { at, onlyIds } }, res): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const onlyIdsArg = onlyIds === 'true';
		const hash = await this.getHashFromAt(at, { api: rcApi });
		const historicApi = await rcApi.at(hash);

		const result = await this.service.fetchEvents(historicApi, {
			hash,
			palletId: stringCamelCase(palletId),
			onlyIds: onlyIdsArg,
		});
		RcPalletsEventsController.sanitizedSend(res, result);
	};
}
