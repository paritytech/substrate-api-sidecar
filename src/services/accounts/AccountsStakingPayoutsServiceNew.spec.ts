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

import { polkadotRegistryV1000001 } from '../../test-helpers/registries';
import { defaultMockApi } from '../test-helpers/mock';
import {
	bondedAt,
	erasRewardPointsAt,
	erasStakersClippedAt,
	erasValidatorPrefsAt,
	erasValidatorRewardAt,
	ledgerAt,
} from '../test-helpers/mock/accounts';
import { AccountsStakingPayoutsService } from './AccountsStakingPayoutsService';

// const era = polkadotRegistryV1000001.createType('EraIndex', 1039);
const historyDepthAt = polkadotRegistryV1000001.createType('u32', 84);

const blockHash = polkadotRegistryV1000001.createType(
	'BlockHash',
	'0xfb8e0fd1366f4b9b3a79864299d7f70a83f44d48cbf9ac135f2d92d9680806a8',
);
const address = '16Divajwsc8nq8NLQUfVyDjbG18xp6GrAS4GSDVBTwm6eY27';
const mockHistoricApi = {
	registry: polkadotRegistryV1000001,
	consts: {
		staking: {
			historyDepth: historyDepthAt,
		},
	},
	query: {
		staking: {
			ledger: ledgerAt,
			erasRewardPoints: erasRewardPointsAt,
			erasValidatorReward: erasValidatorRewardAt,
			erasValidatorPrefs: erasValidatorPrefsAt,
			bonded: bondedAt,
			erasStakersClipped: {
				entries: erasStakersClippedAt,
			},
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

const stakingPayoutsService = new AccountsStakingPayoutsService(mockApi);

describe('AccountsStakingPayoutsService', () => {
	it('fetchAccountStakingPayout', () => {
		const res = stakingPayoutsService.fetchAccountStakingPayout(
			blockHash,
			address,
			1,
			1039,
			false,
			1040,
			mockHistoricApi,
		);

		expect(res).toStrictEqual({});
	});
});
