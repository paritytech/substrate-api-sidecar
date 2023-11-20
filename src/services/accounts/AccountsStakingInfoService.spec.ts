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
import { Option } from '@polkadot/types';
import { AccountId, Hash, StakingLedger } from '@polkadot/types/interfaces';
import { BadRequest, InternalServerError } from 'http-errors';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import { blockHash789629, defaultMockApi, testAddress, testAddressController } from '../test-helpers/mock';
import response789629 from '../test-helpers/responses/accounts/stakingInfo789629.json';
import { AccountsStakingInfoService } from './AccountsStakingInfoService';

export const bondedAt = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => polkadotRegistry.createType('Option<AccountId>', testAddressController));

export const ledgerAt = (_hash: Hash, _address: string): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'Option<StakingLedger>',
			'0x2c2a55b5e0d28cc772b47bb9b25981cbb69eca73f7c3388fb6464e7d24be470e0700e87648170700e8764817008c000000000100000002000000030000000400000005000000060000000700000008000000090000001700000018000000190000001a0000001b0000001c0000001d0000001e0000001f000000200000002100000022000000230000002400000025000000260000002700000028000000290000002a0000002b0000002c0000002d0000002e0000002f000000',
		),
	);

const payeeAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() => polkadotRegistry.createType('RewardDestination', 'Controller'));

const slashingSpansAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() => polkadotRegistry.createType('SlashingSpans'));

const historicApi = {
	query: {
		staking: {
			bonded: bondedAt,
			ledger: ledgerAt,
			payee: payeeAt,
			slashingSpans: slashingSpansAt,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => historicApi,
} as unknown as ApiPromise;

const accountStakingInfoService = new AccountsStakingInfoService(mockApi);

describe('AccountsStakingInfoService', () => {
	describe('fetchAccountStakingInfo', () => {
		it('works with a valid stash address (block 789629)', async () => {
			expect(
				sanitizeNumbers(await accountStakingInfoService.fetchAccountStakingInfo(blockHash789629, testAddress)),
			).toStrictEqual(response789629);
		});

		it('throws a 400 when the given address is not a stash', async () => {
			(historicApi.query.staking.bonded as any) = () =>
				Promise.resolve().then(() => polkadotRegistry.createType('Option<AccountId>', null));

			await expect(
				accountStakingInfoService.fetchAccountStakingInfo(blockHash789629, 'NotStash'),
			).rejects.toStrictEqual(new BadRequest('The address NotStash is not a stash address.'));

			(historicApi.query.staking.bonded as any) = bondedAt;
		});

		it('throws a 404 when the staking ledger cannot be found', async () => {
			(historicApi.query.staking.ledger as any) = () =>
				Promise.resolve().then(() => polkadotRegistry.createType('Option<StakingLedger>', null));

			await expect(
				accountStakingInfoService.fetchAccountStakingInfo(blockHash789629, testAddress),
			).rejects.toStrictEqual(
				new InternalServerError(
					`Staking ledger could not be found for controller address "${testAddressController.toString()}"`,
				),
			);

			(historicApi.query.staking.ledger as any) = ledgerAt;
		});
	});
});
