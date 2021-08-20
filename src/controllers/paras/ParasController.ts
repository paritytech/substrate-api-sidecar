import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { ParasService } from '../../services';
import { IParaIdParam } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class ParasController extends AbstractController<ParasService> {
	constructor(api: ApiPromise) {
		super(api, '/experimental/paras', new ParasService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/', this.getParas],
			['/crowdloans', this.getCrowdloans],
			['/:paraId/crowdloan-info', this.getCrowdloanInfo],
			['/:paraId/lease-info', this.getLeaseInfo],
			['/leases/current', this.getLeasesCurrent],
			['/auctions/current', this.getAuctionsCurrent],
		]);
	}

	private getParas: RequestHandler = async (
		{ query: { at } },
		res
	): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(res, await this.service.paras(hash));
	};

	private getCrowdloanInfo: RequestHandler<IParaIdParam> = async (
		{ params: { paraId }, query: { at } },
		res
	): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);
		const paraIdArg = this.parseNumberOrThrow(
			paraId,
			'paraId must be an integer'
		);

		ParasController.sanitizedSend(
			res,
			await this.service.crowdloansInfo(hash, paraIdArg)
		);
	};

	private getCrowdloans: RequestHandler = async (
		{ query: { at } },
		res
	): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(res, await this.service.crowdloans(hash));
	};

	private getLeaseInfo: RequestHandler<IParaIdParam> = async (
		{ params: { paraId }, query: { at } },
		res
	): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);
		const paraIdArg = this.parseNumberOrThrow(
			paraId,
			'paraId must be an integer'
		);

		ParasController.sanitizedSend(
			res,
			await this.service.leaseInfo(hash, paraIdArg)
		);
	};

	private getLeasesCurrent: RequestHandler = async (
		{ query: { at, currentLeaseHolders } },
		res
	): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);
		const includeCurrentLeaseHolders = currentLeaseHolders !== 'false';

		ParasController.sanitizedSend(
			res,
			await this.service.leasesCurrent(hash, includeCurrentLeaseHolders)
		);
	};

	private getAuctionsCurrent: RequestHandler = async (
		{ query: { at } },
		res
	): Promise<void> => {
		this.checkParasModule();

		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(
			res,
			await this.service.auctionsCurrent(hash)
		);
	};

	private checkParasModule = (): void => {
		if (!this.api.query.paras) {
			throw new Error('Parachains are not yet supported on this network.');
		}
	};
}
