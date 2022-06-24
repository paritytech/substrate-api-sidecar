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
import { RequestHandler } from 'express';
import LRU from 'lru-cache';
import { IBlock } from 'src/types/responses';

import { BlocksService } from '../../services';
import { INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

interface ControllerOptions {
	minCalcFeeRuntime: null | number;
	blockStore: LRU<string, IBlock>;
}

export default class BlocksExtrinsicsController extends AbstractController<BlocksService> {
	constructor(api: ApiPromise, options: ControllerOptions) {
		super(
			api,
			'/blocks/:blockId/extrinsics',
			new BlocksService(api, options.minCalcFeeRuntime, options.blockStore)
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:extrinsicIndex', this.getExtrinsicByTimepoint],
		]);
	}

	/**
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getExtrinsicByTimepoint: RequestHandler<INumberParam> = async (
		{
			params: { blockId, extrinsicIndex },
			query: { eventDocs, extrinsicDocs, feeByEvent },
		},
		res
	): Promise<void> => {
		const hash = await this.getHashForBlock(blockId);

		const eventDocsArg = eventDocs === 'true';
		const extrinsicDocsArg = extrinsicDocs === 'true';
		const getFeeByEvent = feeByEvent === 'true';

		const options = {
			eventDocs: eventDocsArg,
			extrinsicDocs: extrinsicDocsArg,
			checkFinalized: true,
			queryFinalizedHead: false,
			omitFinalizedTag: true,
			getFeeByEvent,
		};

		const historicApi = await this.api.at(hash);

		const block = await this.service.fetchBlock(hash, historicApi, options);

		/**
		 * Verify our param `extrinsicIndex` is an integer represented as a string
		 */
		this.parseNumberOrThrow(
			extrinsicIndex,
			'`exstrinsicIndex` path param is not a number'
		);

		/**
		 * Change extrinsicIndex from a type string to a number before passing it
		 * into any service.
		 */
		const index = parseInt(extrinsicIndex, 10);

		BlocksExtrinsicsController.sanitizedSend(
			res,
			this.service.fetchExtrinsicByIndex(block, index)
		);
	};
}
