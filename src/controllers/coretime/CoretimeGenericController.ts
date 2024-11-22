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

export default class CoretimeGenericController extends AbstractController<CoretimeService> {
	constructor(api: ApiPromise) {
		super(api, '/coretime', new CoretimeService(api));
		this.initRoutes();
	}
	// TODO: check if its either coretime or relay chain, if neither error out
	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			// sale info
			//  configuration
			// status
			['/info', this.getCoretimeOverview],
			// bulk leases
			// leases and regions?
			// ['/workload', this.getParachains],
			// ondemand status
			// ['/workplan', this.getParachains],
		]);
	}
	/*
        relay => => use coretimeAssignmentProvider || onDemandAssignmentProvider
        coretime => bulk time info => use broker

		from relay chains: 
			-
    */

	// get overview on coretime
	private getCoretimeOverview: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkCoretimeModule();

		const hash = await this.getHashFromAt(at);

		CoretimeGenericController.sanitizedSend(res, await this.service.getCoretimeInfo(hash));
	};

	private checkCoretimeModule = (): void => {
		if (this.api.query.onDemandAssignmentProvider && this.api.query.coretimeAssignmentProvider) {
			return;
		} else if (this.api.query.broker) {
			return;
		}
		console.log(this.api.consts);
		throw new Error('One or more coretime modules are not available on this network.');
	};
}
