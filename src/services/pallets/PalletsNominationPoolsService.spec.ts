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
import { ApiDecoration } from '@polkadot/api/types';
import { Hash } from '@polkadot/types/interfaces';


import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import { polkadotRegistry } from '../../test-helpers/registries';
import { PalletsNominationPoolService } from './PalletsNominationPoolsService';

const referendumInfoOfAt = () =>
	Promise.resolve().then(() => {
		polkadotRegistry.createType('ReferendumInfo');
	});

const mockHistoricApi = {
	registry: polkadotRegistry,
	query: {
		democracy: {
			referendumInfoOf: referendumInfoOfAt,
		},
        nominationPools: {
            bondedPools: (): Promise<void> => { return Promise.resolve()},
            rewardPools: (): Promise<void> => { return Promise.resolve()},
        }
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;



const palletsNominationPoolService = new PalletsNominationPoolService(mockApi);

describe('palletsNominationPoolService', () => {
	describe('palletsNominationPoolService.fetchNominationPoolById', () => {
		it('Should return the correct response for an AssetId', async () => {
			const expectedResponse = {
				at: {
					hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
					height: '789629',
				},
				bondedPool: {
					owner: '5CXFhuwT7A1ge4hCa23uCmZWQUebEZSrFdBEE24C41wmAF4N',
					issuer: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
					admin: '5ESEa1HV8hyG6RTXgwWNUhu5fXvkHBfEJKjw3hKmde7fXdHQ',
					freezer: '5ESEa1HV8hyG6RTXgwWNUhu5fXvkHBfEJKjw3hKmde7fXdHQ',
					supply: '10000000',
					deposit: '2000000',
					minBalance: '10000',
					isSufficient: true,
					accounts: '10',
					sufficients: '15',
					approvals: '20',
					isFrozen: false,
				},
				rewardPool: {
					deposit: '2000000',
					name: '0x73746174656d696e74',
					symbol: '0x444f54',
					decimals: '10',
					isFrozen: false,
				},
			};

			const response = await palletsNominationPoolService.fetchNominationPoolById(
                122,
				blockHash789629,
				false,
                mockHistoricApi,
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});
});
