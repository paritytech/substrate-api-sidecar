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
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import response from '../test-helpers/responses/runtime/spec.json';
import { RuntimeSpecService } from './RuntimeSpecService';

const runtimeSpecService = new RuntimeSpecService('mock');

describe('RuntimeSpecService', () => {
	beforeAll(() => {
		jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => defaultMockApi);
	});
	describe('fetchSpec', () => {
		it('works when ApiPromise works', async () => {
			expect(sanitizeNumbers(await runtimeSpecService.fetchSpec(blockHash789629))).toStrictEqual(response);
		});
	});
});
