import { ApiPromise } from '@polkadot/api';
import { BadRequest } from 'http-errors';

import { TransactionDryRunService } from '../../services';
import { IPostRequestHandler, ITx } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class TransactionDryRunController extends AbstractController<
	TransactionDryRunService
> {
	constructor(api: ApiPromise) {
		super(api, '/transaction/dry-run', new TransactionDryRunService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(
			this.path,
			TransactionDryRunController.catchWrap(this.dryRunTransaction)
		);
	}

	private dryRunTransaction: IPostRequestHandler<ITx> = async (
		{ body: { tx }, query: { at } },
		res
	): Promise<void> => {
		if (!tx) {
			throw new BadRequest('Missing field `tx` on request body.');
		}

		const hash =
			typeof at === 'string'
				? await this.getHashForBlock(at)
				: await this.api.rpc.chain.getFinalizedHead();

		TransactionDryRunController.sanitizedSend(
			res,
			await this.service.dryRuntExtrinsic(hash, tx)
		);
	};
}
