// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { CoretimeService } from '../../services';
import AbstractController from '../AbstractController';

export default class CoretimeController extends AbstractController<CoretimeService> {
	constructor(api: ApiPromise) {
		super(api, '/coretime', new CoretimeService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/parachains', this.getParachains],
			// ['/paras/crowdloans', this.getCrowdloans],
			// ['/paras/:paraId/crowdloan-info', this.getCrowdloanInfo],
			// ['/paras/:paraId/lease-info', this.getLeaseInfo],
			// ['/paras/leases/current', this.getLeasesCurrent],
			// ['/paras/auctions/current', this.getAuctionsCurrent],
			// ['/paras/head/included-candidates', this.getParasHeadIncludedCandidates],
			// ['/paras/head/backed-candidates', this.getParasHeadBackedCandidates],
		]);
	}
	// USE broker in api.query.broker to check if tehe connected parachain is using the latest coretime
	// connect

	// get info about chains on coretime

	private getParachains: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		// this.checkParasModule();
		console.log(at);
		const hash = await this.getHashFromAt(at);
		// parachain, id, name, etc, core number, type, last block
		CoretimeController.sanitizedSend(res, await this.service.getCoretimeParachains(hash));
	};

	// get renewal statuses of parachains

	// by parachain id

	// private checkParasModule = (): void => {
	// 	if (!this.api.query.broker) {
	// 		throw new Error('Parachains are not yet supported on this network.');
	// 	}
	// };
}
