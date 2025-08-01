// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { ApiPromiseRegistry } from '../../apiRegistry';
import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { defaultMockApi } from '../test-helpers/mock';
import nodeNetworkResponse from '../test-helpers/responses/node/network.json';
import { NodeNetworkService } from '.';

const nodeNetworkService = new NodeNetworkService('mock');

describe('NodeNetworkService', () => {
	beforeAll(() => {
		jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => defaultMockApi);
	});
	describe('fetchNetwork', () => {
		it('works when ApiPromise works', async () => {
			expect(sanitizeNumbers(await nodeNetworkService.fetchNetwork())).toStrictEqual(nodeNetworkResponse);
		});
	});
});
