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
import { Option } from '@polkadot/types';
import { AccountId, Hash, StakingLedger } from '@polkadot/types/interfaces';
import type { PalletStakingNominations } from '@polkadot/types/lookup';
import { BadRequest, InternalServerError } from 'http-errors';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { kusamaRegistryV1002000, polkadotRegistry, polkadotRegistryV1002000 } from '../../test-helpers/registries';
import {
	activeEraAt21157800,
	activeEraAt22939322,
	blockHash789629,
	blockHash21157800,
	blockHash22939322,
	currentEraAt,
	currentEraAt21157800,
	currentEraAt22939322,
	defaultMockApi,
	defaultMockApi21157800,
	defaultMockApi22939322,
	testAddress,
	testAddressController,
	testAddressControllerKusama,
	testAddressControllerPolkadot,
	testAddressKusama,
	testAddressPayeeKusama,
	testAddressPayeePolkadot,
	testAddressPolkadot,
	testNominatorAddressPolkadot,
} from '../test-helpers/mock';
import {
	kusamaErasStakersMockedCall,
	polkadotClaimedRewardsMockedCall,
	polkadotErasStakersMockedCall,
	polkadotErasStakersOverviewMockedCall,
	polkadotErasStakersPagedMockedCall,
	polkadotPayeeMockedCall,
	polkadotSlashingSpansMockedCall,
	stakingClaimedRewardsMockedCall,
	stakingerasStakersOverviewMockedCall,
	stakingPayeeMockedCall,
	stakingslashingSpansMockedCall,
} from '../test-helpers/mock/accounts/stakingInfo';
import { validators789629Hex } from '../test-helpers/mock/data/validators789629Hex';
import { validators21157800Hex } from '../test-helpers/mock/data/validators21157800Hex';
import { validators22939322Hex } from '../test-helpers/mock/data/validators22939322Hex';
import response789629 from '../test-helpers/responses/accounts/stakingInfo789629.json';
import response21157800 from '../test-helpers/responses/accounts/stakingInfo21157800.json';
import response21157800nominator from '../test-helpers/responses/accounts/stakingInfo21157800nominator.json';
import response22939322 from '../test-helpers/responses/accounts/stakingInfo22939322.json';
import stakingInfo22939322ClaimedFalse from '../test-helpers/responses/accounts/stakingInfo22939322ClaimedFalse.json';
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

const validatorsAt789629 = () =>
	Promise.resolve().then(() => polkadotRegistry.createType('Vec<AccountId32>', validators789629Hex));

const historicApi = {
	query: {
		staking: {
			bonded: bondedAt,
			ledger: ledgerAt,
			payee: payeeAt,
			slashingSpans: slashingSpansAt,
			currentEra: currentEraAt,
		},
		session: {
			validators: validatorsAt789629,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => historicApi,
} as unknown as ApiPromise;

const accountStakingInfoService = new AccountsStakingInfoService(mockApi);

export const bondedAt21157800 = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => polkadotRegistryV1002000.createType('Option<AccountId>', testAddressControllerPolkadot));

export const ledgerAt21157800 = (_hash: Hash, _address: string): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		polkadotRegistryV1002000.createType(
			'Option<StakingLedger>',
			'0x005fa73637062be3fbfb972174a5bc85a2f6cc0350cb84aa9d657422796bfdf10b119b01640c070b119b01640c070088690500006a0500006b0500006c0500006d0500006e0500006f050000700500007105000072050000730500007405000075050000760500007705000078050000790500007a0500007b0500007c0500007d0500007e0500007f050000800500008105000082050000830500008405000085050000860500008705000088050000890500008a050000',
		),
	);

export const payee21157800 = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => polkadotRegistryV1002000.createType('Option<AccountId>', testAddressPayeePolkadot));

const validatorsAt21157800 = () =>
	Promise.resolve().then(() => polkadotRegistryV1002000.createType('Vec<AccountId32>', validators21157800Hex));

const nominations21157800 = (_hash: Hash): Promise<Option<PalletStakingNominations>> =>
	Promise.resolve().then(() =>
		polkadotRegistryV1002000.createType(
			'Option<PalletStakingNominations>',
			'0x04005fa73637062be3fbfb972174a5bc85a2f6cc0350cb84aa9d657422796bfdf16705000000',
		),
	);

const historicApi21157800 = {
	query: {
		staking: {
			bonded: bondedAt21157800,
			ledger: ledgerAt21157800,
			payee: polkadotPayeeMockedCall,
			slashingSpans: polkadotSlashingSpansMockedCall,
			claimedRewards: polkadotClaimedRewardsMockedCall,
			activeEra: activeEraAt21157800,
			currentEra: currentEraAt21157800,
			erasStakersOverview: polkadotErasStakersOverviewMockedCall,
			erasStakers: polkadotErasStakersMockedCall,
			nominators: null,
		},
		session: {
			validators: validatorsAt21157800,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApiPolkadot21157800val = {
	...defaultMockApi21157800,
	at: (_hash: Hash) => historicApi21157800,
} as unknown as ApiPromise;

const accountStakingInfoService21157800val = new AccountsStakingInfoService(mockApiPolkadot21157800val);

const mockApiPolkadot21157800nom = {
	...defaultMockApi21157800,
	at: (_hash: Hash) => ({
		...historicApi21157800,
		query: {
			...historicApi21157800.query,
			staking: {
				...historicApi21157800.query.staking,
				nominators: nominations21157800,
				erasStakersPaged: polkadotErasStakersPagedMockedCall,
			},
		},
	}),
} as unknown as ApiPromise;

const accountStakingInfoService21157800nom = new AccountsStakingInfoService(mockApiPolkadot21157800nom);

export const bondedAt22939322 = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Option<AccountId>', testAddressControllerKusama));

export const ledgerAt22939322 = (_hash: Hash, _address: string): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType(
			'Option<StakingLedger>',
			'0x6c6ed8531e6c0b882af0a42f2f23ef0a102b5d49cb5f5a24ede72d53ffce83170b7962e569db040b7962e569db0400a84719000048190000491900004a1900004b1900004c1900004d1900004e1900004f190000501900005119000052190000531900005419000055190000561900005719000058190000591900005a1900005b1900005c1900005d1900005e1900005f190000601900006119000062190000631900006419000065190000661900006719000068190000691900006a1900006b1900006c1900006d1900006e1900006f19000070190000',
		),
	);

export const payee22939322 = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Option<AccountId>', testAddressPayeeKusama));

const validatorsAt22939322 = () =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Vec<AccountId32>', validators22939322Hex));

const historicApi22939322 = {
	query: {
		staking: {
			bonded: bondedAt22939322,
			ledger: ledgerAt22939322,
			payee: stakingPayeeMockedCall,
			slashingSpans: stakingslashingSpansMockedCall,
			claimedRewards: stakingClaimedRewardsMockedCall,
			activeEra: activeEraAt22939322,
			currentEra: currentEraAt22939322,
			erasStakersOverview: stakingerasStakersOverviewMockedCall,
			erasStakers: kusamaErasStakersMockedCall,
		},
		session: {
			validators: validatorsAt22939322,
		},
	},
} as unknown as ApiDecoration<'promise'>;

const mockApiKusama22939322 = {
	...defaultMockApi22939322,
	at: (_hash: Hash) => historicApi22939322,
} as unknown as ApiPromise;

const accountStakingInfoService22939322 = new AccountsStakingInfoService(mockApiKusama22939322);

describe('AccountsStakingInfoService', () => {
	describe('fetchAccountStakingInfo', () => {
		it('works with a valid stash address (block 789629)', async () => {
			expect(
				sanitizeNumbers(await accountStakingInfoService.fetchAccountStakingInfo(blockHash789629, true, testAddress)),
			).toStrictEqual(response789629);
		});

		it('throws a 400 when the given address is not a stash', async () => {
			(historicApi.query.staking.bonded as any) = () =>
				Promise.resolve().then(() => polkadotRegistry.createType('Option<AccountId>', null));

			await expect(
				accountStakingInfoService.fetchAccountStakingInfo(blockHash789629, true, 'NotStash'),
			).rejects.toStrictEqual(new BadRequest('The address NotStash is not a stash address.'));

			(historicApi.query.staking.bonded as any) = bondedAt;
		});

		it('throws a 404 when the staking ledger cannot be found', async () => {
			(historicApi.query.staking.ledger as any) = () =>
				Promise.resolve().then(() => polkadotRegistry.createType('Option<StakingLedger>', null));

			await expect(
				accountStakingInfoService.fetchAccountStakingInfo(blockHash789629, true, testAddress),
			).rejects.toStrictEqual(
				new InternalServerError(
					`Staking ledger could not be found for controller address "${testAddressController.toString()}"`,
				),
			);

			(historicApi.query.staking.ledger as any) = ledgerAt;
		});

		it('works when `includeClaimedRewards` is set to `false` hence claimedRewards field is not returned in the response', async () => {
			expect(
				sanitizeNumbers(
					await accountStakingInfoService22939322.fetchAccountStakingInfo(blockHash22939322, false, testAddressKusama),
				),
			).toStrictEqual(stakingInfo22939322ClaimedFalse);
		});

		it('works with a valid stash account (block 22939322) and returns eras claimed that include era 6514 (when the migration occurred in Kusama)', async () => {
			expect(
				sanitizeNumbers(
					await accountStakingInfoService22939322.fetchAccountStakingInfo(blockHash22939322, true, testAddressKusama),
				),
			).toStrictEqual(response22939322);
		});

		it('works with a validator account (block 21157800) & returns an array of claimed (including case erasStakersOverview=null & erasStakers>0, era 1419), partially claimed & unclaimed eras (Polkadot)', async () => {
			expect(
				sanitizeNumbers(
					await accountStakingInfoService21157800val.fetchAccountStakingInfo(
						blockHash21157800,
						true,
						testAddressPolkadot,
					),
				),
			).toStrictEqual(response21157800);
		});
		it('works with a nominator account (block 21157800) & returns claimed & unclaimed eras (Polkadot)', async () => {
			expect(
				sanitizeNumbers(
					await accountStakingInfoService21157800nom.fetchAccountStakingInfo(
						blockHash21157800,
						true,
						testNominatorAddressPolkadot,
					),
				),
			).toStrictEqual(response21157800nominator);
		});
	});
});
