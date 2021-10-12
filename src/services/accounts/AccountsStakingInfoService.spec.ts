/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { AccountId, Hash, StakingLedger } from '@polkadot/types/interfaces';
import { BadRequest, InternalServerError } from 'http-errors';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import {
	blockHash789629,
	defaultMockApi,
	testAddress,
	testAddressController,
} from '../test-helpers/mock';
import response789629 from '../test-helpers/responses/accounts/stakingInfo789629.json';
import { AccountsStakingInfoService } from './AccountsStakingInfoService';

export const bondedAt = (
	_hash: Hash,
	_address: string
): Promise<Option<AccountId>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<AccountId>', testAddressController)
	);

export const ledgerAt = (
	_hash: Hash,
	_address: string
): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'Option<StakingLedger>',
			'0x2c2a55b5e0d28cc772b47bb9b25981cbb69eca73f7c3388fb6464e7d24be470e0700e87648170700e8764817008c000000000100000002000000030000000400000005000000060000000700000008000000090000001700000018000000190000001a0000001b0000001c0000001d0000001e0000001f000000200000002100000022000000230000002400000025000000260000002700000028000000290000002a0000002b0000002c0000002d0000002e0000002f000000'
		)
	);

const payeeAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('RewardDestination', 'Controller')
	);

const slashingSpansAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() => polkadotRegistry.createType('SlashingSpans'));

const mockApi = {
	...defaultMockApi,
	query: {
		staking: {
			bonded: { at: bondedAt },
			ledger: { at: ledgerAt },
			payee: { at: payeeAt },
			slashingSpans: { at: slashingSpansAt },
		},
	},
} as unknown as ApiPromise;

const accountStakingInfoService = new AccountsStakingInfoService(mockApi);

describe('AccountsStakingInfoService', () => {
	describe('fetchAccountStakingInfo', () => {
		it('works with a valid stash address (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await accountStakingInfoService.fetchAccountStakingInfo(
						blockHash789629,
						testAddress
					)
				)
			).toStrictEqual(response789629);
		});

		it('throws a 400 when the given address is not a stash', async () => {
			(mockApi.query.staking.bonded as any).at = () =>
				Promise.resolve().then(() =>
					polkadotRegistry.createType('Option<AccountId>', null)
				);

			await expect(
				accountStakingInfoService.fetchAccountStakingInfo(
					blockHash789629,
					'NotStash'
				)
			).rejects.toStrictEqual(
				new BadRequest('The address NotStash is not a stash address.')
			);

			(mockApi.query.staking.bonded as any).at = bondedAt;
		});

		it('throws a 404 when the staking ledger cannot be found', async () => {
			(mockApi.query.staking.ledger as any).at = () =>
				Promise.resolve().then(() =>
					polkadotRegistry.createType('Option<StakingLedger>', null)
				);

			await expect(
				accountStakingInfoService.fetchAccountStakingInfo(
					blockHash789629,
					testAddress
				)
			).rejects.toStrictEqual(
				new InternalServerError(
					`Staking ledger could not be found for controller address "${testAddressController.toString()}"`
				)
			);

			(mockApi.query.staking.ledger as any).at = ledgerAt;
		});
	});
});
