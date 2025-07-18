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

import { validateUseRcBlock } from '../../middleware/validate';
import { BlocksService } from '../../services';
import { ControllerOptions } from '../../types/chains-config';
import { IBlockQueryParams, INumberParam, IRequestHandlerWithMetrics } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class BlocksRawExtrinsicsController extends AbstractController<BlocksService> {
	static controllerName = 'BlocksRawExtrinsics';
	static requiredPallets = [];
	constructor(api: string, options: ControllerOptions) {
		super(
			api,
			'/blocks/:blockId/extrinsics-raw',
			new BlocksService(api, options.minCalcFeeRuntime, options.hasQueryFeeApi),
		);
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateUseRcBlock);
		this.safeMountAsyncGetHandlers([['', this.getBlockRawExtrinsics]]);
	}

	/**
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getBlockRawExtrinsics: IRequestHandlerWithMetrics<INumberParam, IBlockQueryParams> = async (
		{ params: { blockId }, query: { useRcBlock }, method, route },
		res,
	): Promise<void> => {
		const useRcBlockArg = useRcBlock === 'true';

		let hash;
		let rcBlockNumber: string | undefined;

		if (useRcBlockArg) {
			// Treat the blockId parameter as a relay chain block identifier
			rcBlockNumber = blockId;
			hash = await this.getAhAtFromRcAt(blockId);
		} else {
			hash = await this.getHashForBlock(blockId);
		}

		const rawBlock = await this.service.fetchBlockRaw(hash);

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();
			const enhancedResult = {
				...rawBlock,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			BlocksRawExtrinsicsController.sanitizedSend(res, enhancedResult);
		} else {
			BlocksRawExtrinsicsController.sanitizedSend(res, rawBlock);
		}

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
