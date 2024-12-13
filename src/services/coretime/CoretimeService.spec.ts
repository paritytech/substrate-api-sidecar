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

import { blockHash22887036 } from '../test-helpers/mock';
import { blockHash26187139 } from '../test-helpers/mock/mockBlock26187139';
import { mockKusamaCoretimeApiBlock26187139 } from '../test-helpers/mock/mockCoretimeChainApi';
import { mockKusamaApiBlock26187139 } from '../test-helpers/mock/mockKusamaApiBlock26187139';
import { CoretimeService } from './CoretimeService';

const mockKusamaApi = {
	...mockKusamaApiBlock26187139,
	at: (_hash: Hash) => mockKusamaApi,
	consts: {
		...mockKusamaApiBlock26187139.consts,
		coretime: {
			brokerId: 1,
			onDemandAssignmentProvider: {
				maxHistoricalRevenue: {},
			},
		},
	},
	query: {
		coretimeAssignmentProvider: {
			coreSchedules: {
				entries: () => [],
			},
			coreDescriptors: {
				entries: () => [],
			},
			palletVersion: {},
		},
		onDemandAssignmentProvider: {
			palletVersion: () => {},
		},
		paras: {
			paraLifecycles: {
				entries: () => [],
			},
		},
	},
} as unknown as ApiPromise;

const renewalsEntries = () => Promise.resolve().then(() => []);

const mockCoretimeApi = {
	...mockKusamaCoretimeApiBlock26187139,
	at: (_hash: Hash) => mockCoretimeApi,
	consts: {
		...mockKusamaApiBlock26187139.consts,
		broker: {
			timeslicePeriod: 1,
		},
	},
	query: {
		broker: {
			configuration: () =>
				Promise.resolve().then(() =>
					mockKusamaCoretimeApiBlock26187139.registry.createType('Option<PalletBrokerConfigRecord>', {}),
				),
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

const CoretimeServiceAtCoretimeChain = new CoretimeService(mockCoretimeApi);

const CoretimeServiceAtRelayChain = new CoretimeService(mockKusamaApi);

describe('CoretimeService', () => {
	describe('getRegions', () => {
		it('should error with an invalid chain', async () => {
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});
		it('should return regions', async () => {
			// regions and at given block
			// test for coretime and relaychain
			console.log(await CoretimeServiceAtCoretimeChain.getCoretimeRegions(blockHash26187139));
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
