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
// import { StorageKey } from '@polkadot/types';
import { Hash } from '@polkadot/types/interfaces';

import { kusamaCoretimeMetadata } from '../../test-helpers/metadata/coretimeKusamaMetadata';
// import { coretimeKusamaRegistryV1003003 } from '../../test-helpers/registries/coretimeChainKusamaRegistry';
import { createApiWithAugmentations, TypeFactory } from '../../test-helpers/typeFactory';
import { blockHash22887036 } from '../test-helpers/mock';
import { mockLeases, mockRegions, potentialRenewalsMocks } from '../test-helpers/mock/coretime';
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

// const mockRenewals = [
// 	{
// 		completion: 'Complete',
// 		core: '7',
// 		mask: '0xffffffffffffffffffff',
// 		price: '7767758517',
// 		task: '2004',
// 		when: '336168',
// 	},
// 	{
// 		completion: 'Complete',
// 		core: '8',
// 		mask: '0xffffffffffffffffffff',
// 		price: '7769145866',
// 		task: '2011',
// 		when: '326088',
// 	},
// 	{
// 		completion: 'Complete',
// 		core: '11',
// 		mask: '0xffffffffffffffffffff',
// 		price: '7767758517',
// 		task: '2095',
// 		when: '336168',
// 	},
// ];
const coretimeApi = createApiWithAugmentations(kusamaCoretimeMetadata);
const coretimeTypeFactory = new TypeFactory(coretimeApi);

const regionsEntries = () =>
	Promise.resolve().then(() =>
		mockRegions.map((region) => {
			const storageEntry = coretimeApi.query.broker.regions;
			const key = coretimeTypeFactory.storageKey(region.key, 'PalletBrokerRegionId', storageEntry);
			return [
				key,
				mockKusamaCoretimeApiBlock26187139.registry.createType('Option<PalletBrokerRegionRecord>', region.value),
			];
		}),
	);

const leases = () =>
	Promise.resolve().then(() =>
		mockLeases.map((lease) => {
			return mockKusamaCoretimeApiBlock26187139.registry.createType('PalletBrokerLeaseRecordItem', lease);
		}),
	);

const potentialRenewalsEntries = () =>
	Promise.resolve().then(() =>
		potentialRenewalsMocks.map((renewal) => {
			const storageEntry = coretimeApi.query.broker.potentialRenewals;
			const key = coretimeTypeFactory.storageKey(renewal.key, 'PalletBrokerPotentialRenewalId', storageEntry);
			return [
				key,
				mockKusamaCoretimeApiBlock26187139.registry.createType(
					'Option<PalletBrokerPotentialRenewalRecord>',
					renewal.value,
				),
			];
		}),
	);

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
				entries: potentialRenewalsEntries,
			},
			reservations: () => [],
			leases: leases,
			saleInfo: () => {},
			workplan: {
				entries: () => [],
			},
			workload: {
				multi: () => [],
				entries: () => [],
			},
			regions: {
				entries: regionsEntries,
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
			const regions = await CoretimeServiceAtCoretimeChain.getCoretimeRegions(blockHash26187139);
			expect(regions.regions).toHaveLength(2);
			expect(regions.at).toHaveProperty('hash');
			expect(regions.regions[0]).toHaveProperty('begin');
			expect(regions.regions[0]).toHaveProperty('end');
			expect(regions.regions[0]).toHaveProperty('core');
			expect(regions.regions[0]).toHaveProperty('owner');
			expect(regions.regions[0]).toHaveProperty('paid');
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

		it('should return leases', async () => {
			const leases = await CoretimeServiceAtCoretimeChain.getCoretimeLeases(blockHash26187139);

			expect(leases.leases).toHaveLength(2);
			expect(leases.at).toHaveProperty('hash');
			expect(leases.leases[0]).toHaveProperty('task');
			expect(leases.leases[0]).toHaveProperty('until');
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

		it('should return renewals', async () => {
			const renewals = await CoretimeServiceAtCoretimeChain.getCoretimeRenewals(blockHash26187139);
			expect(renewals.renewals).toHaveLength(2);
			expect(renewals.at).toHaveProperty('hash');
			expect(renewals.renewals[0]).toHaveProperty('core');
			expect(renewals.renewals[0]).toHaveProperty('price');
			expect(renewals.renewals[0]).toHaveProperty('task');
			expect(renewals.renewals[0]).toHaveProperty('when');
		});
	});

	describe('getInfo', () => {
		return;
	});

	describe('getCores', () => {
		return;
	});
});
