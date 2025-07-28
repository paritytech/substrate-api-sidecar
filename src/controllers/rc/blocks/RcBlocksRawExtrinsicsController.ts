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

import client from 'prom-client';

import { ApiPromiseRegistry } from '../../../apiRegistry';
import { BlocksService } from '../../../services';
import { ControllerOptions } from '../../../types/chains-config';
import { IBlockQueryParams, INumberParam, IRequestHandlerWithMetrics } from '../../../types/requests';
import AbstractController from '../../AbstractController';

export default class RcBlocksRawExtrinsicsController extends AbstractController<BlocksService> {
	static controllerName = 'RcBlocksRawExtrinsics';
	static requiredPallets = [];
	constructor(_api: string, options: ControllerOptions) {
		const rcApiSpecName = ApiPromiseRegistry.getSpecNameByType('relay')?.values();
		const rcSpecName = rcApiSpecName ? Array.from(rcApiSpecName)[0] : undefined;
		if (!rcSpecName) {
			throw new Error('Relay chain API spec name is not defined.');
		}
		super(
			rcSpecName,
			'/rc/blocks/:blockId/extrinsics-raw',
			new BlocksService(rcSpecName, options.minCalcFeeRuntime, options.hasQueryFeeApi),
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getBlockRawExtrinsics]]);
	}

	private getBlockRawExtrinsics: IRequestHandlerWithMetrics<INumberParam, IBlockQueryParams> = async (
		{ params: { blockId }, method, route },
		res,
	): Promise<void> => {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain API not found, please use SAS_SUBSTRATE_MULTI_CHAIN_URL env variable');
		}

		const hash = await this.getHashFromAt(blockId, { api: rcApi });
		const rawBlock = await this.service.fetchBlockRaw(hash);

		RcBlocksRawExtrinsicsController.sanitizedSend(res, rawBlock);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const path = route.path as string;

		if (res.locals.metrics) {
			const extrinsics_per_block_metrics = res.locals.metrics.registry['sas_extrinsics_per_block'] as client.Histogram;
			extrinsics_per_block_metrics
				.labels({ method: method, route: path, status_code: res.statusCode })
				.observe(rawBlock.extrinsics.length);
		}
	};
}
