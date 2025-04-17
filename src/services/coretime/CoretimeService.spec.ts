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

import type { ApiPromise } from '@polkadot/api';
import type { Hash } from '@polkadot/types/interfaces';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { kusamaCoretimeMetadata } from '../../test-helpers/metadata/coretimeKusamaMetadata';
import { kusamaMetadataV1003003 } from '../../test-helpers/metadata/kusamaMetadataV1003003';
import { createApiWithAugmentations, TypeFactory } from '../../test-helpers/typeFactory';
import { blockHash22887036 } from '../test-helpers/mock';
import {
	mockCoreDescriptors,
	mockLeases,
	mockParasLifeCycles,
	mockRegions,
	mockReservations,
	mockWorkloads,
	mockWorkplans,
	potentialRenewalsMocks,
} from '../test-helpers/mock/coretime';
import { blockHash26187139 } from '../test-helpers/mock/mockBlock26187139';
import { mockKusamaCoretimeApiBlock26187139 } from '../test-helpers/mock/mockCoretimeChainApi';
import { mockKusamaApiBlock26187139 } from '../test-helpers/mock/mockKusamaApiBlock26187139';
import { CoretimeService } from './CoretimeService';

const coretimeApi = createApiWithAugmentations(kusamaCoretimeMetadata);
const kusamaApi = createApiWithAugmentations(kusamaMetadataV1003003);

const coretimeTypeFactory = new TypeFactory(coretimeApi);
const kusamaTypeFactory = new TypeFactory(kusamaApi);

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

const workloadsEntries = () =>
	Promise.resolve().then(() =>
		mockWorkloads.map((workload) => {
			const storageEntry = coretimeApi.query.broker.workload;
			const key = coretimeTypeFactory.storageKey(workload.key, 'U32', storageEntry);
			return [key, [mockKusamaCoretimeApiBlock26187139.registry.createType('PalletBrokerScheduleItem', workload)]];
		}),
	);

const parasLifeCyclesEntries = () =>
	Promise.resolve().then(() =>
		mockParasLifeCycles.map((parasLifeCycle) => {
			const storageEntry = kusamaApi.query.paras.paraLifecycles;
			const key = kusamaTypeFactory.storageKey(parasLifeCycle.key, 'U32', storageEntry);
			return [
				key,
				mockKusamaApiBlock26187139.registry.createType(
					'Option<PolkadotRuntimeParachainsParasParaLifecycle>',
					parasLifeCycle.value,
				),
			];
		}),
	);

const coreDescriptorsEntries = () =>
	Promise.resolve().then(() => {
		return mockCoreDescriptors.map((coreDescriptor) => {
			const storageEntry = kusamaApi.query.coretimeAssignmentProvider.coreDescriptors;
			const key = kusamaTypeFactory.storageKey(coreDescriptor.key, 'U32', storageEntry);

			const currentWork = mockKusamaApiBlock26187139.registry.createType(
				'Option<PolkadotRuntimeParachainsAssignerCoretimeWorkState>',
				coreDescriptor.value.currentWork,
			);

			const queue = mockKusamaApiBlock26187139.registry.createType(
				'Option<PolkadotRuntimeParachainsAssignerCoretimeQueueDescriptor>',
				coreDescriptor.value.queue,
			);

			return [
				key,
				mockKusamaApiBlock26187139.registry.createType('PolkadotRuntimeParachainsAssignerCoretimeCoreDescriptor', {
					...coreDescriptor.value,
					currentWork,
					queue,
				}),
			];
		});
	});

const coreSchedulesEntries = () =>
	Promise.resolve().then(() => {
		return [];
	});

const workplanEntries = () =>
	Promise.resolve().then(() =>
		mockWorkplans.map((workplan) => {
			const storageEntry = coretimeApi.query.broker.workplan;
			const key = coretimeTypeFactory.storageKey(workplan.key, 'StorageKey', storageEntry);
			return [
				key,
				mockKusamaCoretimeApiBlock26187139.registry.createType('Option<Vec<PalletBrokerScheduleItem>>', workplan.value),
			];
		}),
	);

const workplanMultiEntries = () =>
	Promise.resolve().then(() => {
		const storageEntry = coretimeApi.query.broker.workplan;
		const key = coretimeTypeFactory.storageKey(mockWorkplans[0].key, 'StorageKey', storageEntry);
		return [
			key,
			mockKusamaCoretimeApiBlock26187139.registry.createType(
				'Option<Vec<PalletBrokerScheduleItem>>',
				mockWorkplans[0].value,
			),
		];
	});
const mockKusamaApi = {
	...mockKusamaApiBlock26187139,
	at: (_hash: Hash) => mockKusamaApi,
	consts: {
		...mockKusamaApiBlock26187139.consts,
		coretime: {
			brokerId: 1,
		},
		onDemandAssignmentProvider: {
			maxHistoricalRevenue: '50',
		},
	},
	query: {
		coretimeAssignmentProvider: {
			coreSchedules: {
				entries: coreSchedulesEntries,
			},
			coreDescriptors: {
				entries: coreDescriptorsEntries,
			},
			palletVersion: () => Promise.resolve().then(() => '1'),
		},
		onDemandAssignmentProvider: {},
		paras: {
			paraLifecycles: {
				entries: parasLifeCyclesEntries,
			},
		},
	},
} as unknown as ApiPromise;

const mockCoretimeApi = {
	...mockKusamaCoretimeApiBlock26187139,
	at: (_hash: Hash) => mockCoretimeApi,
	consts: {
		...mockKusamaApiBlock26187139.consts,
		broker: {
			timeslicePeriod: mockKusamaCoretimeApiBlock26187139.registry.createType('U32', '80'),
		},
	},
	query: {
		broker: {
			status: () =>
				Promise.resolve().then(() =>
					mockKusamaCoretimeApiBlock26187139.registry.createType('PalletBrokerStatusRecord', {
						coreCount: 100,
						privatePoolSize: 0,
						systemPoolSize: 80,
						lastCommittedTimeslice: 328585,
						lastTimeslice: 328585,
					}),
				),
			configuration: () =>
				Promise.resolve().then(() =>
					mockKusamaCoretimeApiBlock26187139.registry.createType('Option<PalletBrokerConfigRecord>', {
						advanceNotice: 10,
						interludeLength: 50400,
						leadinLength: 50400,
						regionLength: 5040,
						idealBulkProportion: 1000000000,
						limitCoresOffered: null,
						renewalBump: 30000000,
						contributionTimeout: 5040,
					}),
				),
			potentialRenewals: {
				entries: potentialRenewalsEntries,
			},
			reservations: () =>
				Promise.resolve().then(() =>
					mockReservations.map((reservation) => {
						return [mockKusamaCoretimeApiBlock26187139.registry.createType('PalletBrokerScheduleItem', reservation)];
					}),
				),
			leases: leases,
			saleInfo: () =>
				Promise.resolve().then(() =>
					mockKusamaCoretimeApiBlock26187139.registry.createType('Option<PalletBrokerSaleInfoRecord>', {
						saleStart: 1705849,
						leadinLength: 50400,
						endPrice: 776775851,
						regionBegin: 331128,
						regionEnd: 336168,
						idealCoresSold: 81,
						coresOffered: 81,
						firstCore: 19,
						selloutPrice: 32205681617,
						coresSold: 69,
					}),
				),
			workplan: {
				entries: workplanEntries,
			},
			workload: {
				multi: workplanMultiEntries,
				entries: workloadsEntries,
			},
			regions: {
				entries: regionsEntries,
			},
		},
	},
} as unknown as ApiPromise;

const CoretimeServiceAtCoretimeChain = new CoretimeService('mock');

const CoretimeServiceAtRelayChain = new CoretimeService('mock');

describe('CoretimeService', () => {
	describe('getRegions', () => {
		it('should error with an invalid chain', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockKusamaApi;
			});
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});
		it('should return regions', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockCoretimeApi;
			});
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
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockKusamaApi;
			});
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});

		it('should return leases', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockCoretimeApi;
			});
			const leases = await CoretimeServiceAtCoretimeChain.getCoretimeLeases(blockHash26187139);

			expect(leases.leases).toHaveLength(2);
			expect(leases.at).toHaveProperty('hash');
			expect(leases.leases[0]).toHaveProperty('task');
			expect(leases.leases[0]).toHaveProperty('until');
		});
	});

	describe('getReservations', () => {
		it('should error with an invalid chain', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockKusamaApi;
			});
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});

		it('should return reservations', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockCoretimeApi;
			});
			const reservations = await CoretimeServiceAtCoretimeChain.getCoretimeReservations(blockHash26187139);
			expect(reservations.reservations).toHaveLength(3);
			expect(reservations.at).toHaveProperty('hash');
			expect(reservations.reservations[0]).toHaveProperty('mask');
			expect(reservations.reservations[0]).toHaveProperty('task');
		});
	});

	describe('getRenewals', () => {
		it('should error with an invalid chain', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockKusamaApi;
			});
			await expect(CoretimeServiceAtRelayChain.getCoretimeRegions(blockHash22887036)).rejects.toThrow(
				'This endpoint is only available on coretime chains.',
			);
		});

		it('should return renewals', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockCoretimeApi;
			});
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
		it('should return info data for relay chain coretime', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockKusamaApi;
			});
			const info = await CoretimeServiceAtRelayChain.getCoretimeInfo(blockHash22887036);
			expect(info).toHaveProperty('at');
			expect(info).toHaveProperty('brokerId');

			if ('brokerId' in info) {
				expect(info.brokerId).not.toBeNull();
				expect(info).toHaveProperty('palletVersion');
				expect(info.palletVersion).not.toBeNull();
			} else {
				throw new Error('BrokerId is not present in the info object');
			}
		});

		it('should return info data for coretime chain coretime', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockCoretimeApi;
			});
			const info = await CoretimeServiceAtCoretimeChain.getCoretimeInfo(blockHash26187139);
			expect(info).toHaveProperty('at');
			expect(info).toHaveProperty('configuration');
			if ('configuration' in info) {
				expect(info.configuration).not.toBeNull();
				expect(info.configuration?.leadinLength).toBe(50400);
				expect(info).toHaveProperty('currentRegion');
				expect(info).toHaveProperty('cores');
				expect(info).toHaveProperty('phase');
				expect(info.currentRegion).not.toBeNull();
			} else {
				throw new Error('Configuration is not present in the info object');
			}
		});
	});

	describe('getCores', () => {
		it('should get cores for coretime chain', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockCoretimeApi;
			});
			const cores = await CoretimeServiceAtCoretimeChain.getCoretimeCores(blockHash26187139);
			expect(cores.cores).toHaveLength(2);
			expect(cores.at).toHaveProperty('hash');
			expect(cores.cores && cores.cores[0]).toHaveProperty('coreId');
			expect(cores.cores && cores.cores[0]).toHaveProperty('regions');
			expect(cores.cores && cores.cores[0]).toHaveProperty('paraId');
		});

		it('should get cores for relay chain', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => {
				return mockKusamaApi;
			});
			const cores = await CoretimeServiceAtRelayChain.getCoretimeCores(blockHash26187139);
			expect(cores.cores).toHaveLength(2);
			expect(cores.at).toHaveProperty('hash');
			expect(cores.cores && cores.cores[0]).toHaveProperty('paraId');
			expect(cores.cores && cores.cores[0]).toHaveProperty('type');
			expect(cores.cores && cores.cores[0]).toHaveProperty('info');
			const coresData = cores.cores;
			if (coresData && 'info' in coresData[0]) {
				expect(coresData[0].info).toHaveProperty('currentWork');
				expect(coresData[0].info.currentWork).toHaveProperty('assignments');
			}
		});
	});
});
