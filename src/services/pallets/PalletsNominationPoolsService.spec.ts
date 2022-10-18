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


import {
	getBondedPools,
	getRewardPools,
	// getMetadata,
} from '../test-helpers/mock/data/mockNonimationPoolResponseData';
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
            bondedPools: getBondedPools,
            rewardPools: getRewardPools,
        },
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;



const palletsNominationPoolService = new PalletsNominationPoolService(mockApi);

describe('palletsNominationPoolService', () => {
	describe('palletsNominationPoolService.fetchNominationPoolById', () => {
		it('Should return the correct response for a nomination pool without metadata', async () => {
			const expectedResponse = {
				at: {
					hash: "0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578",
					height: "789629"
				},
				bondedPool: {
					points: "2000000000000",
					state: "Destroying",
					memberCounter: "1",
					roles: {
						depositor: "15uHYQkvPf3iBQn7mLYbdrf1fYFpE77zVR5hsKGSGYKm5rU9",
						root: "15LkJX3hcxnHkaTdzq3n3HfKKgRcPJZA7VMNEqtMSfm8xgjR",
						nominator: "15LkJX3hcxnHkaTdzq3n3HfKKgRcPJZA7VMNEqtMSfm8xgjR",
						stateToggler: "15LkJX3hcxnHkaTdzq3n3HfKKgRcPJZA7VMNEqtMSfm8xgjR"
					}
				},
				rewardPool: {
					"lastRecordedRewardCounter": "0",
					"lastRecordedTotalPayouts": "0",
					"totalRewardsClaimed": "0"
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

		it('Should return the correct response for a nomination pool with metadata', async () => {
			const expectedResponse = {
				at: {
					hash: "0x64c6d3db75e33e5ef617bc9851078a4c387fcff7ca0eada54e46293d532e3c84",
					height: "789629"
				},
				bondedPool: {
					points: "2000000000000",
					state: "Destroying",
					memberCounter: "1",
					roles: {
						depositor: "15uHYQkvPf3iBQn7mLYbdrf1fYFpE77zVR5hsKGSGYKm5rU9",
						root: "15LkJX3hcxnHkaTdzq3n3HfKKgRcPJZA7VMNEqtMSfm8xgjR",
						nominator: "15LkJX3hcxnHkaTdzq3n3HfKKgRcPJZA7VMNEqtMSfm8xgjR",
						stateToggler: "15LkJX3hcxnHkaTdzq3n3HfKKgRcPJZA7VMNEqtMSfm8xgjR"
					}
				},
				rewardPool: {
					"lastRecordedRewardCounter": "0",
					"lastRecordedTotalPayouts": "0",
					"totalRewardsClaimed": "0"
				},
				metadata: "0x4a757374204174652053746f6d61636861636865",
			};

			const blockHashAt = polkadotRegistry.createType("BlockHash", "0x64c6d3db75e33e5ef617bc9851078a4c387fcff7ca0eada54e46293d532e3c84");

			const response = await palletsNominationPoolService.fetchNominationPoolById(
                122,
				blockHashAt,
				true,
                mockHistoricApi,
			);

			expect(sanitizeNumbers(response)).toStrictEqual(expectedResponse);
		});
	});
});
