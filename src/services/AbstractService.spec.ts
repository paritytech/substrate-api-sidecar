import { ApiPromise } from '@polkadot/api';
import { Hash } from '@polkadot/types/interfaces';
import { BadRequest, HttpError } from 'http-errors';

import {
	AbstractService,
	EtheuremAddressNotSupported,
} from './AbstractService';
import { defaultMockApi } from './test-helpers/mock';

class TestAbstractService extends AbstractService {
	public handleEtheuremAddressError(): HttpError {
		return this.createHttpErrorForAddr(
			'0x0000000000000000000000000000000000000000',
			new Error('Ups! something is wrong.')
		);
	}

	public handlePolkadotAddressError(): HttpError {
		return this.createHttpErrorForAddr(
			'EQBwtmKWCyRrQ8yGWg7LkB8p7hpEKXZz4qUg9WR8hZmieCM',
			new Error('Ups! something is wrong.')
		);
	}
}

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => ({}),
} as unknown as ApiPromise;

const testService = new TestAbstractService(mockApi);

describe('AbstractService', () => {
	describe('createHttpErrorForAddr', () => {
		it('should throws an error instanceof EtheuremAddressNotSupported', () => {
			const err = testService.handleEtheuremAddressError();

			expect(err.expose).toBeTruthy();
			expect(err.headers).toBeUndefined();
			expect(err.message).not.toBeUndefined();
			expect(err.name).toEqual(EtheuremAddressNotSupported.name);
			expect(err.stack).not.toBeUndefined();
			expect(err.status).toEqual(400);
			expect(err.statusCode).toEqual(400);
			expect(err).toBeInstanceOf(EtheuremAddressNotSupported);
		});

		it('should throws an error instanceof BadRequest', () => {
			const err = testService.handlePolkadotAddressError();

			expect(err.expose).toBeTruthy();
			expect(err.headers).toBeUndefined();
			expect(err.message).not.toBeUndefined();
			expect(err.name).toEqual(BadRequest.name);
			expect(err.stack).not.toBeUndefined();
			expect(err.status).toEqual(400);
			expect(err.statusCode).toEqual(400);
			expect(err).toBeInstanceOf(BadRequest);
		});
	});
});
