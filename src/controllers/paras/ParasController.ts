import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { IParaIdParam } from 'src/types/requests';

import { ParasService } from '../../services';
import AbstractController from '../AbstractController';

export default class ParasController extends AbstractController<ParasService> {
	constructor(api: ApiPromise) {
		super(api, '/experimental/paras', new ParasService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([
			['/:paraId/lease-info', this.getLeaseInfo],
			['/auctions/current', this.getAuctionsCurrent],

		]);
	}

	private getLeaseInfo: RequestHandler<IParaIdParam> = async (
		{ params: { paraId }, query: { at } },
		res
	): Promise<void> => {
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

	private getAuctionsCurrent: RequestHandler = async (
		{ query: { at } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		ParasController.sanitizedSend(
			res,
			await this.service.auctionsCurrent(hash)
		);
	};
}
