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

import { validateBoolean } from '../../middleware';
import { ParasService } from '../../services';
import { IParaIdParam } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class ParasController extends AbstractController<ParasService> {
	constructor(api: ApiPromise) {
		super(api, '', new ParasService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path + '/paras/leases/current', validateBoolean(['currentLeaseHolders']));
		this.safeMountAsyncGetHandlers([
			['/paras', this.getParas],
			['/paras/crowdloans', this.getCrowdloans],
			['/paras/:paraId/crowdloan-info', this.getCrowdloanInfo],
			['/paras/:paraId/lease-info', this.getLeaseInfo],
			['/paras/leases/current', this.getLeasesCurrent],
			['/paras/auctions/current', this.getAuctionsCurrent],
			['/paras/head/included-candidates', this.getParasHeadIncludedCandidates],
			['/paras/head/backed-candidates', this.getParasHeadBackedCandidates],
			['/experimental/paras/', this.getParas],
			['/experimental/paras/crowdloans', this.getCrowdloans],
			['/experimental/paras/:paraId/crowdloan-info', this.getCrowdloanInfo],
			['/experimental/paras/:paraId/lease-info', this.getLeaseInfo],
			['/experimental/paras/leases/current', this.getLeasesCurrent],
			['/experimental/paras/auctions/current', this.getAuctionsCurrent],
		]);
	}

	private getParas: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(res, await this.service.paras(hash));
	};

	private getParasHeadIncludedCandidates: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(res, await this.service.parasHead(hash, 'CandidateIncluded'));
	};

	private getParasHeadBackedCandidates: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(res, await this.service.parasHead(hash, 'CandidateBacked'));
	};

	private getCrowdloanInfo: RequestHandler<IParaIdParam> = async (
		{ params: { paraId }, query: { at } },
		res,
	): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);
		const paraIdArg = this.parseNumberOrThrow(paraId, 'paraId must be an integer');

		ParasController.sanitizedSend(res, await this.service.crowdloansInfo(hash, paraIdArg));
	};

	private getCrowdloans: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(res, await this.service.crowdloans(hash));
	};

	private getLeaseInfo: RequestHandler<IParaIdParam> = async (
		{ params: { paraId }, query: { at } },
		res,
	): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);
		const paraIdArg = this.parseNumberOrThrow(paraId, 'paraId must be an integer');

		ParasController.sanitizedSend(res, await this.service.leaseInfo(hash, paraIdArg));
	};

	private getLeasesCurrent: RequestHandler = async ({ query: { at, currentLeaseHolders } }, res): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);
		const includeCurrentLeaseHolders = currentLeaseHolders !== 'false';

		ParasController.sanitizedSend(res, await this.service.leasesCurrent(hash, includeCurrentLeaseHolders));
	};

	private getAuctionsCurrent: RequestHandler = async ({ query: { at } }, res): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(res, await this.service.auctionsCurrent(hash));
	};

	private checkParasModule = (): void => {
		if (!this.api.query.paras) {
			throw new Error('Parachains are not yet supported on this network.');
		}
	};
}
