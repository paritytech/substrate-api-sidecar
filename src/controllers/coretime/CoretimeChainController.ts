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

export default class CoretimeChainController extends AbstractController<CoretimeService> {
	constructor(api: ApiPromise) {
		super(api, '/coretime', new CoretimeService(api));
		this.initRoutes();
	}
	// TODO: check if its either coretime or relay chain, if neither error out
	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/sale', this.getCoretimeSaleInfo],
			['/bulk', this.getBulk],
			['/leases', this.getLeases],
			['/regions', this.getRegions],
			['/cores', this.getWorkload],
		]);
	}
	/*
        relay => => use coretimeAssignmentProvider || onDemandAssignmentProvider
        coretime => bulk time info => use broker

		from relay chains: 
			-
    */

	private checkCoretimeModule = (): void => {
		if (this.api.query.onDemandAssignmentProvider && this.api.query.coretimeAssignmentProvider) {
			return;
		} else if (this.api.query.broker) {
			return;
		}
		console.log(this.api.consts);
		throw new Error('One or more coretime modules are not available on this network.');
	};

	// get overview on coretime
	private getBulk: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkCoretimeModule();

		const hash = await this.getHashFromAt(at);

		CoretimeChainController.sanitizedSend(res, await this.service.getBulkInfo(hash));
	};

	private getLeases: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkCoretimeModule();

		const hash = await this.getHashFromAt(at);

		CoretimeChainController.sanitizedSend(res, await this.service.getCoretimeLeases(hash));
	};

	private getCoretimeSaleInfo: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkCoretimeModule();

		const hash = await this.getHashFromAt(at);

		CoretimeChainController.sanitizedSend(res, await this.service.getCoretimeSaleInfo(hash));
	};

	private getRegions: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkCoretimeModule();

		const hash = await this.getHashFromAt(at);

		CoretimeChainController.sanitizedSend(res, await this.service.getCoretimeRegions(hash));
	};

	private getWorkload: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkCoretimeModule();

		const hash = await this.getHashFromAt(at);

		CoretimeChainController.sanitizedSend(res, await this.service.getCoretimeCores(hash));
	};
}
