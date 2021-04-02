import { ApiPromise } from '@polkadot/api';

import { ParasService } from '../../services';
import AbstractController from '../AbstractController';

export default class ParasController extends AbstractController<ParasService> {
	constructor(api: ApiPromise) {
		super(api, '/experimental/paras', new ParasService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([]);
	}
}
