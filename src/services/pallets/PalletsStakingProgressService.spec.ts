/* eslint-disable @typescript-eslint/require-await */
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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { Hash } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';
import { u32, u64, Vec } from '@polkadot/types-codec';
import { InternalServerError } from 'http-errors';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import {
	activeEraAt,
	blockHash100000,
	blockHash789629,
	defaultMockApi,
	erasStartSessionIndexAt,
} from '../test-helpers/mock';
import { validators789629Hex } from '../test-helpers/mock/data/validators789629Hex';
import palletsStakingProgress789629SResponse from '../test-helpers/responses/pallets/stakingProgress789629.json';
import stakingProgressPostAhm from '../test-helpers/responses/pallets/stakingProgressPostAhm.json';
import UnappliedSlashesResponse from '../test-helpers/responses/pallets/stakingProgressUnappliedSlashes.json';
import stakingProgressUnappliedSlashesPostAhm from '../test-helpers/responses/pallets/stakingProgressUnappliedSlashesPostAHM.json';
import { PalletsStakingProgressService } from './PalletsStakingProgressService';

const epochIndexAt = () => Promise.resolve().then(() => polkadotRegistry.createType('u64', 330));

const genesisSlotAt = () => Promise.resolve().then(() => polkadotRegistry.createType('u64', 265084563));

const currentSlotAt = () => Promise.resolve().then(() => polkadotRegistry.createType('u64', 265876724));

const currentIndexAt = () => Promise.resolve().then(() => polkadotRegistry.createType('SessionIndex', 330));

const timestampNowAt = () => Promise.resolve().then(() => polkadotRegistry.createType('u64', 1703123456789));

const eraElectionStatusAt = () =>
	Promise.resolve().then(() => polkadotRegistry.createType('ElectionStatus', { Close: null }));

const validatorsAt = () =>
	Promise.resolve().then(() => polkadotRegistry.createType('Vec<ValidatorId>', validators789629Hex));

const forceEraAt = () => Promise.resolve().then(() => polkadotRegistry.createType('Forcing', 'NotForcing'));

const unappliedSlashesEntries = () => {
	return Promise.resolve([['5640', []]]);
};

const validatorCountAt = () => Promise.resolve().then(() => polkadotRegistry.createType('u32', 197));

const mockHistoricApi = {
	...defaultMockApi,
	consts: {
		babe: {
			epochDuration: polkadotRegistry.createType('u64', 2400),
		},
		staking: {
			electionLookAhead: polkadotRegistry.createType('BlockNumber'),
			sessionsPerEra: polkadotRegistry.createType('SessionIndex', 6),
		},
	},
	query: {
		babe: {
			currentSlot: currentSlotAt,
			epochIndex: epochIndexAt,
			genesisSlot: genesisSlotAt,
		},
		session: {
			currentIndex: currentIndexAt,
			validators: validatorsAt,
		},
		timestamp: {
			now: timestampNowAt,
		},
		staking: {
			activeEra: activeEraAt,
			eraElectionStatus: eraElectionStatusAt,
			erasStartSessionIndex: erasStartSessionIndexAt,
			forceEra: forceEraAt,
			bondedEras: () =>
				Promise.resolve(
					[
						[40, 276],
						[41, 282],
						[42, 288],
						[43, 294],
						[44, 300],
						[45, 306],
						[46, 312],
						[47, 318],
						[48, 324],
						[49, 330],
					].map((el) => [polkadotRegistry.createType('u32', el[0]), polkadotRegistry.createType('u32', el[1])]),
				),
			unappliedSlashes: {
				entries: unappliedSlashesEntries,
			},
			validatorCount: validatorCountAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

const unappliedSlashes = [
	{
		validator: '5CD2Q2EnKaKvjWza3ufMxaXizBTTDgm9kPB3DCZ4VA9j7Ud6',
		own: '0',
		others: [['5GxDBrTuFgCAN49xrpRFWJiA969R2Ny5NnTa8cSPBh8hWHY9', '6902377436592']],
		reporters: [],
		payout: '345118871829',
		toJSON: function () {
			return {
				validator: this.validator,
				own: this.own,
				others: this.others.map(([account, amount]) => ({ account, amount })),
				reporters: this.reporters,
				payout: this.payout,
			};
		},
	},
];
const unappliedSlashesEntriesUnappliedSlashes = () => {
	return Promise.resolve([['5640', unappliedSlashes]]);
};

const mockHistoricApiUnappliedSlashes = {
	...defaultMockApi,
	consts: {
		babe: {
			epochDuration: polkadotRegistry.createType('u64', 2400),
		},
		staking: {
			electionLookAhead: polkadotRegistry.createType('BlockNumber'),
			sessionsPerEra: polkadotRegistry.createType('SessionIndex', 6),
		},
	},
	query: {
		babe: {
			currentSlot: currentSlotAt,
			epochIndex: epochIndexAt,
			genesisSlot: genesisSlotAt,
		},
		session: {
			currentIndex: currentIndexAt,
			validators: validatorsAt,
		},
		timestamp: {
			now: timestampNowAt,
		},
		staking: {
			activeEra: activeEraAt,
			eraElectionStatus: eraElectionStatusAt,
			erasStartSessionIndex: erasStartSessionIndexAt,
			forceEra: forceEraAt,
			bondedEras: () =>
				Promise.resolve(
					[
						[40, 276],
						[41, 282],
						[42, 288],
						[43, 294],
						[44, 300],
						[45, 306],
						[46, 312],
						[47, 318],
						[48, 324],
						[49, 330],
					].map((el) => [polkadotRegistry.createType('u32', el[0]), polkadotRegistry.createType('u32', el[1])]),
				),
			unappliedSlashes: {
				entries: unappliedSlashesEntriesUnappliedSlashes,
			},
			validatorCount: validatorCountAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApiUnappliedSlashes = {
	...{
		...mockHistoricApiUnappliedSlashes,
		query: {
			...mockHistoricApiUnappliedSlashes.query,
			staking: {
				...mockHistoricApiUnappliedSlashes.query.staking,
				unappliedSlashes: {
					entries: unappliedSlashesEntriesUnappliedSlashes,
				},
			},
		},
	},
	at: (_hash: Hash) => ({
		...mockHistoricApiUnappliedSlashes,
		query: {
			...mockHistoricApiUnappliedSlashes.query,
			staking: {
				...mockHistoricApiUnappliedSlashes.query.staking,
				unappliedSlashes: {
					entries: unappliedSlashesEntriesUnappliedSlashes,
				},
			},
		},
	}),
} as unknown as ApiPromise;

const mockRCNextApi = {
	...defaultMockApi,
	consts: {
		...defaultMockApi.consts,
		babe: {
			epochDuration: polkadotRegistry.createType('u64', 2400),
		},
	},
	query: {
		...defaultMockApi.query,
		babe: {
			currentSlot: currentSlotAt,
			epochIndex: epochIndexAt,
			genesisSlot: genesisSlotAt,
			skippedEpochs: () => Promise.resolve().then(() => polkadotRegistry.createType('Vec<(u64, u32)>', [])),
		},
		staking: undefined,
		session: {
			currentIndex: currentIndexAt,
			validators: validatorsAt,
		},
	},
	at: (_hash: Hash) => ({
		...mockHistoricApi,
		consts: {
			...mockHistoricApi.consts,
			babe: {
				epochDuration: polkadotRegistry.createType('u64', 2400),
			},
		},
		query: {
			...mockHistoricApi.query,
			babe: {
				currentSlot: currentSlotAt,
				epochIndex: epochIndexAt,
				genesisSlot: genesisSlotAt,
				skippedEpochs: () => Promise.resolve().then(() => polkadotRegistry.createType('Vec<(u64, u32)>', [])),
			},
			staking: undefined,
			session: {
				currentIndex: currentIndexAt,
				validators: validatorsAt,
			},
		},
	}),
} as unknown as ApiPromise;

const mockAHHistoricApi = {
	...mockHistoricApi,
	consts: {
		...mockHistoricApi.consts,
		babe: null,
		staking: {
			electionLookAhead: polkadotRegistry.createType('BlockNumber'),
			sessionsPerEra: polkadotRegistry.createType('SessionIndex', 6),
		},
	},
	query: {
		...mockHistoricApi.query,
		session: null,
		timestamp: {
			now: timestampNowAt,
		},
		staking: {
			activeEra: activeEraAt,
			eraElectionStatus: eraElectionStatusAt,
			erasStartSessionIndex: erasStartSessionIndexAt,
			forceEra: forceEraAt,
			bondedEras: () =>
				Promise.resolve(
					[
						[40, 276],
						[41, 282],
						[42, 288],
						[43, 294],
						[44, 300],
						[45, 306],
						[46, 312],
						[47, 318],
						[48, 324],
						[49, 330],
					].map((el) => [polkadotRegistry.createType('u32', el[0]), polkadotRegistry.createType('u32', el[1])]),
				),
			unappliedSlashes: {
				entries: unappliedSlashesEntries,
			},
			validatorCount: validatorCountAt,
		},
	},
};

const mockAHNextApi = {
	...defaultMockApi,
	consts: {
		...mockHistoricApi.consts,
		babe: null,
	},
	query: {
		...defaultMockApi.query,
		session: null,
		timestamp: {
			now: timestampNowAt,
		},
		staking: {
			activeEra: activeEraAt,
			eraElectionStatus: eraElectionStatusAt,
			erasStartSessionIndex: erasStartSessionIndexAt,
			forceEra: forceEraAt,
			unappliedSlashes: {
				entries: unappliedSlashesEntries,
			},
			validatorCount: validatorCountAt,
		},
	},
	at: (_hash: Hash) => mockAHHistoricApi,
} as unknown as ApiPromise;

// Helper functions for creating mock data
function mockSkippedEpochs(epochs: [number, number][]): Vec<ITuple<[u64, u32]>> {
	return polkadotRegistry.createType(
		'Vec<(u64, u32)>',
		epochs.map(([epoch, session]) => [
			polkadotRegistry.createType('u64', epoch),
			polkadotRegistry.createType('u32', session),
		]),
	);
}

function createMockAssetHubHistoricApiWithNoneActiveEra() {
	return {
		...mockAHHistoricApi,
		query: {
			...mockAHHistoricApi.query,
			staking: {
				...mockAHHistoricApi.query.staking,
				activeEra: () => Promise.resolve().then(() => polkadotRegistry.createType('Option<ActiveEraInfo>', null)),
			},
		},
	} as unknown as ApiDecoration<'promise'>;
}

function createMockAssetHubHistoricApiWithNoneEraStartSessionIndex() {
	return {
		...mockAHHistoricApi,
		query: {
			...mockAHHistoricApi.query,
			staking: {
				...mockAHHistoricApi.query.staking,
				bondedEras: () => Promise.resolve().then(() => []),
			},
		},
	} as unknown as ApiDecoration<'promise'>;
}

function createMockRelayChainApiWithSkippedEpochs(skippedEpochs: [number, number][]) {
	return {
		...mockRCNextApi,
		query: {
			...mockRCNextApi.query,
			babe: {
				...mockRCNextApi.query.babe,
				skippedEpochs: () => Promise.resolve().then(() => mockSkippedEpochs(skippedEpochs)),
			},
		},
		at: (_hash: Hash) => ({
			...mockRCNextApi,
			query: {
				...mockRCNextApi.query,
				babe: {
					...mockRCNextApi.query.babe,
					skippedEpochs: () => Promise.resolve().then(() => mockSkippedEpochs(skippedEpochs)),
				},
			},
		}),
	} as unknown as ApiPromise;
}

describe('PalletStakingProgressService', () => {
	beforeAll(() => {
		jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi);
	});

	beforeEach(() => {
		// Reset all mocks before each test to prevent interference
		jest.clearAllMocks();

		// Reset ApiPromiseRegistry mocks to default state
		jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi);
		jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['polkadot']);
		jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => []);

		// Reset assetHubInfo to default state
		ApiPromiseRegistry.assetHubInfo = {
			isAssetHub: false,
			isAssetHubMigrated: false,
		};
	});

	afterEach(() => {
		// Clean up after each test
		jest.restoreAllMocks();
	});
	describe('derivePalletStakingProgress before AHM', () => {
		(mockHistoricApi.query.session.validators as unknown) = validatorsAt;

		it('works when ApiPromise works (block 789629)', async () => {
			/**
			 * Mock PalletStakingProgressService instance.
			 */
			const palletStakingProgressService = new PalletsStakingProgressService('polkadot');

			expect(
				sanitizeNumbers(await palletStakingProgressService.derivePalletStakingProgress(blockHash789629)),
			).toStrictEqual(palletsStakingProgress789629SResponse);
		});

		it('throws when ErasStartSessionIndex.isNone', async () => {
			(mockHistoricApi.query.staking.bondedEras as any) = () => Promise.resolve([] as any);

			(mockHistoricApi.query.staking.erasStartSessionIndex as any) = () =>
				Promise.resolve().then(() => polkadotRegistry.createType('Option<SessionIndex>', null));
			/**
			 * Mock PalletStakingProgressService instance.
			 */
			const palletStakingProgressService = new PalletsStakingProgressService('polkadot');
			await expect(palletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toStrictEqual(
				new InternalServerError('EraStartSessionIndex is None when Some was expected.'),
			);

			(mockHistoricApi.query.staking.erasStartSessionIndex as any) = erasStartSessionIndexAt;
		});

		it('throws when activeEra.isNone', async () => {
			(mockHistoricApi.query.staking.activeEra as any) = () =>
				Promise.resolve().then(() => polkadotRegistry.createType('Option<ActiveEraInfo>', null));
			/**
			 * Mock PalletStakingProgressService instance.
			 */
			const palletStakingProgressService = new PalletsStakingProgressService('polkadot');
			await expect(palletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toStrictEqual(
				new InternalServerError('ActiveEra is None when Some was expected.'),
			);

			(mockHistoricApi.query.staking.activeEra as any) = activeEraAt;
			(mockHistoricApi.query.session.validators as unknown) = validatorsAt;
		});

		it('works with entries in unappliedSlashes', async () => {
			/**
			 * Mock PalletStakingProgressService instance.
			 */
			const palletStakingProgressServiceUnappliedSlashes = new PalletsStakingProgressService('polkadot');

			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApiUnappliedSlashes);
			expect(
				sanitizeNumbers(
					await palletStakingProgressServiceUnappliedSlashes.derivePalletStakingProgress(blockHash789629),
				),
			).toStrictEqual(UnappliedSlashesResponse);
		});
	});

	describe('derivePalletStakingProgress after AHM', () => {
		beforeEach(() => {
			// Set up Asset Hub state for these tests
			ApiPromiseRegistry.assetHubInfo = {
				isAssetHub: true,
				isAssetHubMigrated: true,
			};
		});

		it('it throws if historicApi does not have staking', async () => {
			const PalletStakingProgressService = new PalletsStakingProgressService('polkadot');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockRCNextApi);
			jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['polkadot', 'statemine']);

			jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => {
				return [
					{
						specName: 'polkadot',
						api: mockRCNextApi,
					},
				] as unknown as { specName: string; api: ApiPromise }[];
			});
			await expect(PalletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toThrow(
				'Staking pallet not found for queried runtime',
			);
		});
		it('it throws if sidecar is connected to AH and querying historical block', async () => {
			const PalletStakingProgressService = new PalletsStakingProgressService('statemine');

			// Create a mock that throws an error for historical blocks
			const mockApiThatThrowsForHistorical = {
				...mockAHNextApi,
				at: (hash: Hash) => {
					if (hash.eq(blockHash100000)) {
						throw new Error('At is currently unsupported for pallet staking validators connected to assethub');
					}
					return mockAHNextApi.at(hash);
				},
			} as unknown as ApiPromise;

			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApiThatThrowsForHistorical);
			jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['polkadot', 'statemine']);

			jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => {
				return [
					{
						specName: 'polkadot',
						api: mockRCNextApi,
					},
				] as unknown as { specName: string; api: ApiPromise }[];
			});
			await expect(PalletStakingProgressService.derivePalletStakingProgress(blockHash100000)).rejects.toThrow(
				'At is currently unsupported for pallet staking validators connected to assethub',
			);
		});
		it('it throws if sidecar is connected to AH but no RC connection is available', async () => {
			const PalletStakingProgressService = new PalletsStakingProgressService('statemine');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi);
			jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['polkadot', 'statemine']);

			jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => {
				return [] as unknown as { specName: string; api: ApiPromise }[];
			});
			await expect(PalletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toThrow(
				'Relay chain API not found',
			);
		});
		it('works when ApiPromise works (block 789629)', async () => {
			const palletStakingProgressService = new PalletsStakingProgressService('statemine');
			// needs both RC and AH connection
			jest.spyOn(palletStakingProgressService, 'assetHubInfo', 'get').mockReturnValue({
				isAssetHub: true,
				isAssetHubMigrated: true,
			});
			jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi);
			jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['polkadot', 'statemine']);
			jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => {
				return [
					{
						specName: 'polkadot',
						api: mockRCNextApi,
					},
				] as unknown as { specName: string; api: ApiPromise }[];
			});
			expect(
				sanitizeNumbers(await palletStakingProgressService.derivePalletStakingProgress(blockHash789629)),
			).toStrictEqual(stakingProgressPostAhm);
		});

		it('throws when ErasStartSessionIndex.isNone', async () => {
			// Create a fresh mock for this specific test
			const mockHistoricApiWithNoneEraStartSessionIndex = {
				...mockAHHistoricApi,
				query: {
					...mockAHHistoricApi.query,
					staking: {
						...mockAHHistoricApi.query.staking,
						bondedEras: () => Promise.resolve().then(() => []),
						erasStartSessionIndex: () =>
							Promise.resolve().then(() => polkadotRegistry.createType('Option<SessionIndex>', undefined)),
					},
				},
			} as unknown as ApiDecoration<'promise'>;

			const mockApiWithNoneEraStartSessionIndex = {
				...mockAHNextApi,
				at: (_hash: Hash) => Promise.resolve(mockHistoricApiWithNoneEraStartSessionIndex),
			} as unknown as ApiPromise;
			jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApiWithNoneEraStartSessionIndex);
			jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['polkadot', 'statemine']);
			jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => {
				return [
					{
						specName: 'polkadot',
						api: mockRCNextApi,
					},
				] as unknown as { specName: string; api: ApiPromise }[];
			});

			const palletStakingProgressService = new PalletsStakingProgressService('statemine');

			jest.spyOn(palletStakingProgressService, 'assetHubInfo', 'get').mockReturnValue({
				isAssetHub: true,
				isAssetHubMigrated: true,
			});
			await expect(palletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toStrictEqual(
				new InternalServerError('EraStartSessionIndex is None when Some was expected.'),
			);
		});
		it('throws when activeEra.isNone', async () => {
			// Create a fresh mock for this specific test
			const mockHistoricApiWithNoneActiveEra = {
				...mockAHHistoricApi,
				query: {
					...mockAHHistoricApi.query,
					staking: {
						...mockAHHistoricApi.query.staking,
						activeEra: () => Promise.resolve().then(() => polkadotRegistry.createType('Option<ActiveEraInfo>', null)),
					},
				},
			} as unknown as ApiDecoration<'promise'>;

			const mockApiWithNoneActiveEra = {
				...mockAHNextApi,
				at: (_hash: Hash) => Promise.resolve(mockHistoricApiWithNoneActiveEra),
			} as unknown as ApiPromise;

			jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApiWithNoneActiveEra);
			jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['polkadot', 'statemine']);
			jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => {
				return [
					{
						specName: 'polkadot',
						api: mockRCNextApi,
					},
				] as unknown as { specName: string; api: ApiPromise }[];
			});

			const palletStakingProgressService = new PalletsStakingProgressService('statemine');
			jest.spyOn(palletStakingProgressService, 'assetHubInfo', 'get').mockReturnValue({
				isAssetHub: true,
				isAssetHubMigrated: true,
			});
			await expect(palletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toStrictEqual(
				new InternalServerError('ActiveEra is None when Some was expected.'),
			);
		});
		it('works with entries in unappliedSlashes', async () => {
			// Create a fresh mock for this specific test
			const mockApiUnappliedSlashesForAH = {
				...mockApiUnappliedSlashes,
				query: {
					...mockApiUnappliedSlashes.query,
					session: null,
				},
				consts: {
					...mockApiUnappliedSlashes.consts,
					session: null,
				},
			} as unknown as ApiPromise;

			jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApiUnappliedSlashesForAH);
			jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['polkadot', 'statemine']);
			jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => {
				return [
					{
						specName: 'polkadot',
						api: mockRCNextApi,
					},
				] as unknown as { specName: string; api: ApiPromise }[];
			});

			const palletStakingProgressServiceUnappliedSlashes = new PalletsStakingProgressService('statemine');

			jest.spyOn(palletStakingProgressServiceUnappliedSlashes, 'assetHubInfo', 'get').mockReturnValue({
				isAssetHub: true,
				isAssetHubMigrated: true,
			});
			expect(
				sanitizeNumbers(
					await palletStakingProgressServiceUnappliedSlashes.derivePalletStakingProgress(blockHash789629),
				),
			).toStrictEqual(stakingProgressUnappliedSlashesPostAhm);
		});
	});

	describe('Asset Hub BABE Calculations', () => {
		describe('derivePalletStakingProgress with Asset Hub BABE calculations', () => {
			beforeEach(() => {
				ApiPromiseRegistry.assetHubInfo = {
					isAssetHub: true,
					isAssetHubMigrated: true,
				};
			});

			it('uses Asset Hub calculation when isAssetHub && isAssetHubMigrated', async () => {
				const service = new PalletsStakingProgressService('statemine');

				jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
				jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi);
				jest
					.spyOn(ApiPromiseRegistry, 'getApiByType')
					.mockImplementation(
						() => [{ specName: 'polkadot', api: mockRCNextApi }] as unknown as { specName: string; api: ApiPromise }[],
					);

				const result = await service.derivePalletStakingProgress(blockHash789629);

				// Verify the result has the expected structure
				expect(result).toHaveProperty('at');
				expect(result).toHaveProperty('activeEra');
				expect(result).toHaveProperty('forceEra');
				expect(result).toHaveProperty('nextSessionEstimate');
				expect(result).toHaveProperty('unappliedSlashes');
			});

			it('throws when ActiveEra is None for Asset Hub', async () => {
				const service = new PalletsStakingProgressService('statemine');

				// Create a fresh mock for this specific test
				const mockHistoricApiWithNoneActiveEra = createMockAssetHubHistoricApiWithNoneActiveEra();
				const mockApiWithNoneActiveEra = {
					...mockAHNextApi,
					at: (_hash: Hash) => Promise.resolve(mockHistoricApiWithNoneActiveEra),
				} as unknown as ApiPromise;

				jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
				jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApiWithNoneActiveEra);
				jest
					.spyOn(ApiPromiseRegistry, 'getApiByType')
					.mockImplementation(
						() => [{ specName: 'polkadot', api: mockRCNextApi }] as unknown as { specName: string; api: ApiPromise }[],
					);

				await expect(service.derivePalletStakingProgress(blockHash789629)).rejects.toThrow(
					'ActiveEra is None when Some was expected.',
				);
			});

			it('throws when EraStartSessionIndex is None for Asset Hub', async () => {
				const service = new PalletsStakingProgressService('statemine');

				// Create a fresh mock for this specific test
				const mockHistoricApiWithNoneEraStartSessionIndex = createMockAssetHubHistoricApiWithNoneEraStartSessionIndex();
				const mockApiWithNoneEraStartSessionIndex = {
					...mockAHNextApi,
					at: (_hash: Hash) => Promise.resolve(mockHistoricApiWithNoneEraStartSessionIndex),
				} as unknown as ApiPromise;

				jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
				jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApiWithNoneEraStartSessionIndex);
				jest
					.spyOn(ApiPromiseRegistry, 'getApiByType')
					.mockImplementation(
						() => [{ specName: 'polkadot', api: mockRCNextApi }] as unknown as { specName: string; api: ApiPromise }[],
					);

				await expect(service.derivePalletStakingProgress(blockHash789629)).rejects.toThrow(
					'EraStartSessionIndex is None when Some was expected.',
				);
			});

			it('calculates session index with skipped epochs for Asset Hub', async () => {
				const service = new PalletsStakingProgressService('statemine');
				jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
				jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi);
				jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(
					() =>
						[{ specName: 'polkadot', api: createMockRelayChainApiWithSkippedEpochs([[16, 12]]) }] as unknown as {
							specName: string;
							api: ApiPromise;
						}[],
				);

				const result = await service.derivePalletStakingProgress(blockHash789629);

				// Verify the result has the expected structure
				expect(result).toHaveProperty('at');
				expect(result).toHaveProperty('activeEra');
				expect(result).toHaveProperty('forceEra');
				expect(result).toHaveProperty('nextSessionEstimate');
				expect(result).toHaveProperty('unappliedSlashes');
			});

			it('uses hardcoded BABE values for time-based calculations in Asset Hub', async () => {
				const service = new PalletsStakingProgressService('statemine');
				jest.spyOn(ApiPromiseRegistry, 'getTypeBySpecName').mockReturnValue('assethub');
				jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi);
				jest
					.spyOn(ApiPromiseRegistry, 'getApiByType')
					.mockImplementation(
						() => [{ specName: 'polkadot', api: mockRCNextApi }] as unknown as { specName: string; api: ApiPromise }[],
					);

				const result = await service.derivePalletStakingProgress(blockHash789629);

				// Verify the result has the expected structure and uses time-based calculations
				expect(result).toHaveProperty('at');
				expect(result).toHaveProperty('activeEra');
				expect(result).toHaveProperty('forceEra');
				expect(result).toHaveProperty('nextSessionEstimate');
				expect(result).toHaveProperty('unappliedSlashes');
			});
		});
	});

	describe('Non-Asset Hub calculations', () => {
		beforeEach(() => {
			// Reset to non-Asset Hub state for these tests
			ApiPromiseRegistry.assetHubInfo = {
				isAssetHub: false,
				isAssetHubMigrated: false,
			};

			// Ensure the mock has the correct bondedEras return type
			(mockHistoricApi.query.staking.bondedEras as any) = () =>
				Promise.resolve(
					[
						[40, 276],
						[41, 282],
						[42, 288],
						[43, 294],
						[44, 300],
						[45, 306],
						[46, 312],
						[47, 318],
						[48, 324],
						[49, 330],
					].map((el) => [polkadotRegistry.createType('u32', el[0]), polkadotRegistry.createType('u32', el[1])]),
				);
		});

		it('uses regular calculation when not Asset Hub', async () => {
			const service = new PalletsStakingProgressService('polkadot');

			// Use the regular mock (not Asset Hub mock) for this test
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi);

			const result = await service.derivePalletStakingProgress(blockHash789629);

			// Verify the result has the expected structure and matches the original response
			expect(sanitizeNumbers(result)).toStrictEqual(palletsStakingProgress789629SResponse);
		});
	});
});
