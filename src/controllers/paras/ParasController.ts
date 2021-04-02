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
			['/crowdloans', this.getCrowdloans],
			['/:paraId/crowdloans-info', this.getCrowdloansInfo],
		]);
	}

	private getCrowdloansInfo: RequestHandler<IParaIdParam> = async (
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
			await this.service.crowdloansInfo(hash, paraIdArg)
		);
	};

	private getCrowdloans: RequestHandler = async (
		{ query: { at, fundInfo } },
		res
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		const includeFundInfo = fundInfo === 'true' ? true : false;

		ParasController.sanitizedSend(
			res,
			await this.service.crowdloans(hash, includeFundInfo)
		);
	};
}
