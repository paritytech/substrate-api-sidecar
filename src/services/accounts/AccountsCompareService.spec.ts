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

import { ApiPromise } from '@polkadot/api';

import { ApiPromiseRegistry } from '../../apiRegistry/index.ts';
import { sanitizeNumbers } from '../../sanitize';
import { defaultMockApi } from '../test-helpers/mock';
import { AccountsCompareService } from './AccountsCompareService';

const mockApi = {
	...defaultMockApi,
} as unknown as ApiPromise;
const validateService = new AccountsCompareService('mock');

describe('Compare two addresses', () => {
	beforeAll(() => {
		jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
			return mockApi;
		});
	});
	it('Should compare the two addresses and return that they are not equal, along with the details of each address.', () => {
		const expectedResponse = {
			areEqual: false,
			addresses: [
				{
					ss58Format: '7P9y4pUmp5SJ4gKK3rFw6TvR24eqW7jVoyDs8LPunRYcHuzi',
					ss58Prefix: '63',
					network: 'hydradx',
					publicKey: '0xf5e51345031c9ba63ae27605d028ad959ba7f4eba289fb16368ddfab2788936f',
				},
				{
					ss58Format: '1kFahMfeRf4XJbApbczHczTTioF9NzKBe9D8g5xFw9JAVdE',
					ss58Prefix: '0',
					network: 'polkadot',
					publicKey: '0x20fca2e352c4906760cb18af6a36e42169e489246ed739307e01b4922a5d119f',
				},
			],
		};
		const address1 = '7P9y4pUmp5SJ4gKK3rFw6TvR24eqW7jVoyDs8LPunRYcHuzi';
		const address2 = '1kFahMfeRf4XJbApbczHczTTioF9NzKBe9D8g5xFw9JAVdE';

		expect(sanitizeNumbers(validateService.accountCompare([address1, address2]))).toStrictEqual(expectedResponse);
	});

	it('Should compare the four addresses and return that they are equal, along with the details of each address.', () => {
		const expectedResponse = {
			areEqual: true,
			addresses: [
				{
					ss58Format: '1jeB5w8XyBADtgmVmwk2stWpTyfTVWEgLo85tF7gYVxnmSw',
					ss58Prefix: '0',
					network: 'polkadot',
					publicKey: '0x20857206fde63ea508a317a77bc1ca2a795c978533b71fc7bc21d352d832637c',
				},
				{
					ss58Format: 'DJxh51wJYvcY1VhJqhnngRN7SGFZrmH4DuPKFXicFgwMQCT',
					ss58Prefix: '2',
					network: 'kusama',
					publicKey: '0x20857206fde63ea508a317a77bc1ca2a795c978533b71fc7bc21d352d832637c',
				},
				{
					ss58Format: 'WfwU3e9TRYo1Bi62SLrvPDe3th8jQeqd3ZnAJTczpUQCNZ8',
					ss58Prefix: '5',
					network: 'astar',
					publicKey: '0x20857206fde63ea508a317a77bc1ca2a795c978533b71fc7bc21d352d832637c',
				},
				{
					ss58Format: 'cTbj3BYqiRXAF7YvyDtJHV4hNqRnbHMoz7umz6vTg4tUjCY',
					ss58Prefix: '6',
					network: 'bifrost',
					publicKey: '0x20857206fde63ea508a317a77bc1ca2a795c978533b71fc7bc21d352d832637c',
				},
			],
		};
		const address1 = '1jeB5w8XyBADtgmVmwk2stWpTyfTVWEgLo85tF7gYVxnmSw';
		const address2 = 'DJxh51wJYvcY1VhJqhnngRN7SGFZrmH4DuPKFXicFgwMQCT';
		const address3 = 'WfwU3e9TRYo1Bi62SLrvPDe3th8jQeqd3ZnAJTczpUQCNZ8';
		const address4 = 'cTbj3BYqiRXAF7YvyDtJHV4hNqRnbHMoz7umz6vTg4tUjCY';

		expect(sanitizeNumbers(validateService.accountCompare([address1, address2, address3, address4]))).toStrictEqual(
			expectedResponse,
		);
	});
});
