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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { EraIndex, Hash } from '@polkadot/types/interfaces';
import { InternalServerError } from 'http-errors';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import { activeEraAt, blockHash789629, defaultMockApi, erasStartSessionIndexAt } from '../test-helpers/mock';
import { validators789629Hex } from '../test-helpers/mock/data/validators789629Hex';
import palletsStakingProgress789629SResponse from '../test-helpers/responses/pallets/stakingProgress789629.json';
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

const unappliedSlashesAt = (_activeEra: EraIndex) =>
	Promise.resolve().then(() => polkadotRegistry.createType('Vec<UnappliedSlash>', []));

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
			unappliedSlashes: unappliedSlashesAt,
			validatorCount: validatorCountAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

/**
 * Mock PalletStakingProgressService instance.
 */
const palletStakingProgressService = new PalletsStakingProgressService(mockApi);

describe('PalletStakingProgressService', () => {
	describe('derivePalletStakingProgress', () => {
		(mockHistoricApi.query.session.validators as unknown) = validatorsAt;

		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(await palletStakingProgressService.derivePalletStakingProgress(blockHash789629)),
			).toStrictEqual(palletsStakingProgress789629SResponse);
		});

		it('throws when ErasStartSessionIndex.isNone', async () => {
			(mockHistoricApi.query.staking.erasStartSessionIndex as any) = () =>
				Promise.resolve().then(() => polkadotRegistry.createType('Option<SessionIndex>', null));

			await expect(palletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toStrictEqual(
				new InternalServerError('EraStartSessionIndex is None when Some was expected.'),
			);

			(mockHistoricApi.query.staking.erasStartSessionIndex as any) = erasStartSessionIndexAt;
		});

		it('throws when activeEra.isNone', async () => {
			(mockHistoricApi.query.staking.activeEra as any) = () =>
				Promise.resolve().then(() => polkadotRegistry.createType('Option<ActiveEraInfo>', null));

			await expect(palletStakingProgressService.derivePalletStakingProgress(blockHash789629)).rejects.toStrictEqual(
				new InternalServerError('ActiveEra is None when Some was expected.'),
			);

			(mockHistoricApi.query.staking.activeEra as any) = activeEraAt;
			(mockHistoricApi.query.session.validators as unknown) = validatorsAt;
		});
	});
});
