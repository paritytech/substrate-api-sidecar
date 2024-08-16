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
import client from 'prom-client';

import { BlocksService } from '../../services';
import { ControllerOptions } from '../../types/chains-config';
import { INumberParam, IRequestHandlerWithMetrics } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class BlocksRawExtrinsicsController extends AbstractController<BlocksService> {
	constructor(api: ApiPromise, options: ControllerOptions) {
		super(
			api,
			'/blocks/:blockId/extrinsics-raw',
			new BlocksService(api, options.minCalcFeeRuntime, options.blockStore, options.hasQueryFeeApi),
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getBlockRawExtrinsics]]);
	}

	/**
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getBlockRawExtrinsics: IRequestHandlerWithMetrics<INumberParam> = async (
		{ params: { blockId }, method, route },
		res,
	): Promise<void> => {
		const hash = await this.getHashForBlock(blockId);
		const rawBlock = await this.service.fetchBlockRaw(hash);
		BlocksRawExtrinsicsController.sanitizedSend(res, rawBlock);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const path = route.path as string;

		if (res.locals.metrics) {
			const extrinsics_per_block_metrics = res.locals.metrics.registry[
				'sas_extrinsics_per_block_count'
			] as client.Histogram;
			extrinsics_per_block_metrics
				.labels({ method: method, route: path, status_code: res.statusCode })
				.observe(rawBlock.extrinsics.length);
		}
	};
}
