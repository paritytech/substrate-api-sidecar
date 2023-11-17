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
import { Hash } from '@polkadot/types/interfaces';
import { BadRequest, HttpError } from 'http-errors';

import { AbstractService, EtheuremAddressNotSupported } from './AbstractService';
import { defaultMockApi } from './test-helpers/mock';

class TestAbstractService extends AbstractService {
	public handleEtheuremAddressError(): HttpError {
		return this.createHttpErrorForAddr(
			'0x0000000000000000000000000000000000000000',
			new Error('Ups! something is wrong.'),
		);
	}

	public handlePolkadotAddressError(): HttpError {
		return this.createHttpErrorForAddr(
			'EQBwtmKWCyRrQ8yGWg7LkB8p7hpEKXZz4qUg9WR8hZmieCM',
			new Error('Ups! something is wrong.'),
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
