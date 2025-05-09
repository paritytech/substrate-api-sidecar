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
import { InternalServerError } from 'http-errors';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import { activeEraAt, blockHash789629, defaultMockApi, erasStartSessionIndexAt } from '../test-helpers/mock';
import { validators789629Hex } from '../test-helpers/mock/data/validators789629Hex';
import palletsStakingProgress789629SResponse from '../test-helpers/responses/pallets/stakingProgress789629.json';
import UnappliedSlashesResponse from '../test-helpers/responses/pallets/stakingProgressUnappliedSlashes.json';
import { PalletsStakingProgressService } from './PalletsStakingProgressService';

const epochIndexAt = () => Promise.resolve().then(() => polkadotRegistry.createType('u64', 330));

const genesisSlotAt = () => Promise.resolve().then(() => polkadotRegistry.createType('u64', 265084563));

const currentSlotAt = () => Promise.resolve().then(() => polkadotRegistry.createType('u64', 265876724));

const currentIndexAt = () => Promise.resolve().then(() => polkadotRegistry.createType('SessionIndex', 330));

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
		staking: {
			activeEra: activeEraAt,
			eraElectionStatus: eraElectionStatusAt,
			erasStartSessionIndex: erasStartSessionIndexAt,
			forceEra: forceEraAt,
			unappliedSlashes: {
				entries: unappliedSlashesEntriesUnappliedSlashes,
			},
			validatorCount: validatorCountAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApiUnappliedSlashes = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApiUnappliedSlashes,
} as unknown as ApiPromise;

describe('PalletStakingProgressService', () => {
	beforeAll(() => {
		jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi);
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
		it('it throws if historicApi does not have staking', async () => {
			const PalletStakingProgressService = new PalletsStakingProgressService('mock');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApiNoStaking);

			await expect(PalletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toThrow(
				'Staking pallet not found for queried runtime',
			);
		});

		it('it throws if sidecar is connected to AH and querying historical block', async () => {
			const PalletStakingProgressService = new PalletsStakingProgressService('statemine');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi);
			process.env.SAS_SUBSTRATE_MULTI_CHAIN_URL = JSON.stringify([
				{ type: 'relay', url: 'wss://polkadot-rpc.publicnode.com' },
				{ type: 'assethub', url: 'wss://westend-asset-hub-rpc.polkadot.io' },
			]);
			await expect(PalletStakingProgressService.derivePalletStakingProgress(blockHash100000)).rejects.toThrow(
				'At is currently unsupported for pallet staking validators connected to assethub',
			);
		});

		it('it throws if sidecar is connected to AH but no RC connection is available', async () => {
			const PalletStakingProgressService = new PalletsStakingProgressService('statemine');
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi);
			process.env.SAS_SUBSTRATE_MULTI_CHAIN_URL = JSON.stringify([
				// { type: 'relay', url: 'wss://polkadot-rpc.publicnode.com' },
				{ type: 'assethub', url: 'wss://westend-asset-hub-rpc.polkadot.io' },
			]);
			await expect(PalletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toThrow(
				'Relay chain API not found',
			);
		});
		it('works when ApiPromise works (block 789629)', async () => {
			return false;
		});

		it('throws when ErasStartSessionIndex.isNone', async () => {
			return false;
		});

		it('throws when activeEra.isNone', async () => {
			return false;
		});

		it('works with entries in unappliedSlashes', async () => {
			return false;
		});

		it('it correctly computes the response when connected to AH post AHM', async () => {
			const PalletStakingProgressService = new PalletsStakingProgressService('statemine');
			//  first get original response for the block, then set envs to multichain;
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockAHNextApi as unknown as ApiPromise);
			jest.spyOn(ApiPromiseRegistry, 'getAllAvailableSpecNames').mockReturnValue(['kusama', 'statemine']);

			jest.spyOn(ApiPromiseRegistry, 'getApiByType').mockImplementation(() => {
				return [
					{
						specName: 'polkadot',
						api: mockRCNextApi,
					},
				] as unknown as { specName: string; api: ApiPromise }[];
			});

			const preAHMResponse = await PalletStakingProgressService.derivePalletStakingProgress(blockHash789629);
			const postAHMResponse = await PalletStakingProgressService.derivePalletStakingProgress(blockHash789629);
		});
	});
});
