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
import { IPalletsEventsParam } from 'src/types/requests';

import { validateRcAt } from '../../middleware';
import { PalletsEventsService } from '../../services';
import AbstractController from '../AbstractController';

export default class PalletsEventsController extends AbstractController<PalletsEventsService> {
	static controllerName = 'PalletsEvents';
	static requiredPallets = [];
	constructor(api: string) {
		super(api, '/pallets/:palletId/events', new PalletsEventsService(api));

		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([
			['/:eventItemId', this.getEventById as RequestHandler],
			['/', this.getEvents],
		]);
	}

	private getEventById: RequestHandler<IPalletsEventsParam, unknown, unknown> = async (
		{ query: { at, metadata, rcAt }, params: { palletId, eventItemId } },
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

		const result = await this.service.fetchEventItem(historicApi, {
			hash,
			// stringCamelCase ensures we don't have snake case or kebab case
			palletId: stringCamelCase(palletId),
			eventItemId: stringCamelCase(eventItemId),
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

			PalletsEventsController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsEventsController.sanitizedSend(res, result);
		}
	};

	private getEvents: RequestHandler = async (
		{ params: { palletId }, query: { at, onlyIds, rcAt } },
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

		const result = await this.service.fetchEvents(historicApi, {
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

			PalletsEventsController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsEventsController.sanitizedSend(res, result);
		}
	};
}
