// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { blockHash22887036, defaultMockApi, mockApiBlock22887036 } from '../test-helpers/mock';
import { CoretimeService } from './CoretimeService';

// const mockCoretimeApi = {
// 	...defaultMockApi,
// 	consts: {
// 		...defaultMockApi.consts,
// 		coretime: {
// 			brokerId: 1,
// 			onDemandAssignmentProvider: {
// 				maxHistoricalRevenue: {},
// 			},
// 		},
// 	},
// 	query: {
// 		coretimeAssignmentProvider: {
// 			coreSchedules: {
// 				entries: () => [],
// 			},
// 			coreDescriptors: {
// 				entries: () => [],
// 			},
// 			palletVersion: {},
// 		},
// 		onDemandAssignmentProvider: {
// 			palletVersion: () => {},
// 		},
// 		paras: {
// 			paraLifecycles: {
// 				entries: () => [],
// 			},
// 		},
// 	},
// } as unknown as ApiPromise;

const renewalsEntries = () => Promise.resolve().then(() => []);

const mockApi = {
	...mockApiBlock22887036,
	at: (_hash: Hash) => mockApi,
	consts: {
		...defaultMockApi.consts,
		broker: {
			timeslicePeriod: 1,
		},
	},
	query: {
		broker: {
			configuration: () =>
				Promise.resolve().then(() => mockApiBlock22887036.registry.createType('Option<PalletBrokerConfigRecord>', {})),
			potentialRenewals: {
				entries: renewalsEntries,
			},
			reservations: () => [],
			leases: () => [],
			saleInfo: () => {},
			workplan: {
				entries: () => [],
			},
			workload: {
				multi: () => [],
				entries: () => [],
			},
			regions: {
				entries: () => [],
			},
		},
		paras: {
			paraLifecycles: {
				entries: () => [],
			},
		},
	},
} as unknown as ApiPromise;

// const CoretimeServiceAtCoretimeChain = new CoretimeService(mockCoretimeApi);

const CoretimeServiceAtRelayChain = new CoretimeService(mockApi);

describe('CoretimeService', () => {
	describe('getRegions', () => {
        console.log(mockApi.query.broker.configuration());
		it('should error with an invalid chain', async () => {
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});
		it('should return regions', () => {
			// regions and at given block
			// test for coretime and relaychain
			return;
		});

		it('should return empty array if no regions', () => {
			return;
		});
	});

	describe('getLeases', () => {
		it('should error with an invalid chain', async () => {
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});
	});

	describe('getReservations', () => {
		it('should error with an invalid chain', async () => {
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});
	});

	describe('getRenewals', () => {
		it('should error with an invalid chain', async () => {
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});
	});

	describe('getInfo', () => {
		return;
	});

	describe('getCores', () => {
		return;
	});
});
