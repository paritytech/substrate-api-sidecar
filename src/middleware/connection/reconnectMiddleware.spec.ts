import { ApiPromise } from '@polkadot/api';
import { Request, Response } from 'express';

import { reconnectMiddleware } from './reconnectMiddleware';

const mockApi = {} as unknown as ApiPromise;

describe('reconnectMiddleware', () => {
	const apiConnectionCache = {
		isReconnecting: false,
	};

	it('Should successfully call next when connected', () => {
		const res = jest.fn() as unknown as Response,
			req = jest.fn() as unknown as Request,
			next = jest.fn();

		reconnectMiddleware(mockApi, apiConnectionCache)(req, res, next);

		expect(next).toBeCalled();
	});
});
