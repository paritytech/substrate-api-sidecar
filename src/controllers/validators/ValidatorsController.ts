import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

import { validateAddress } from '../../middleware';
import { ValidatorsService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET information about the Substrates node's implementation and versioning.
 *
 * Returns:
 * - `clientVersion`: Node binary version.
 * - `clientImplName`: Node's implementation name.
 * - `chain`: Node's chain name.
 */
export default class ValidatorsController extends AbstractController<ValidatorsService> {
	constructor(api: ApiPromise) {
		super(api, '/validators', new ValidatorsService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path + '/:address', validateAddress);

		this.safeMountAsyncGetHandlers([
			['', this.getValidatorsList],
			['/:address', this.getValidatorDetail],
		]);
	}

	private castArray(param: unknown): string[] | undefined {
		if (Array.isArray(param)) return param.map((p) => String(p));

		if (typeof param === 'string') {
			return param.split(',');
		}
		return undefined;
	}

	private parseStatus(status: unknown): string {
		if (!status) {
			return 'all';
		}

		if (typeof status !== 'string') {
			throw new BadRequest('Incorrect type for param status');
		}

		return status;
	}

	/**
	 * GET information about the Substrates node's implementation and versioning.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	getValidatorsList: RequestHandler = async (
		{ query: { addresses, status, detailed, ignoreCache } },
		res
	): Promise<void> => {
		const ignoreCacheArg = ignoreCache === 'true' ? true : false;
		const detailedArg = detailed === 'true' ? true : false;
		const addressesArg = this.castArray(addresses);
		const statusArg = this.parseStatus(status);

		if (ignoreCacheArg) {
			ValidatorsController.sanitizedSend(
				res,
				await this.service.fetchValidatorsList(
					statusArg,
					addressesArg,
					detailedArg
				)
			);
		} else {
			ValidatorsController.sanitizedSend(
				res,
				await this.service.cachedValidatorsList(
					statusArg,
					addressesArg,
					detailedArg
				)
			);
		}
	};

	/**
	 * GET information about the Substrates node's implementation and versioning.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	getValidatorDetail: RequestHandler = async (
		{ params: { address } },
		res
	): Promise<void> => {
		ValidatorsController.sanitizedSend(
			res,
			await this.service.fetchValidatorDetail(address)
		);
	};
}
