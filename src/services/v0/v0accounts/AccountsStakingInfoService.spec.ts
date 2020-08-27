/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { sanitizeNumbers } from '../../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../../test-helpers/registries';
import {
	blockHash789629,
	bondedAt,
	ledgerAt,
	mockApi,
	testAddress,
	testAddressController,
} from '../../test-helpers/mock';
import * as response789629 from '../../test-helpers/responses/accounts/stakingInfo789629.json';
import { AccountsStakingInfoService } from './AccountsStakingInfoService';

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
			).rejects.toStrictEqual({
				error: 'The address NotStash is not a stash address.',
				statusCode: 400,
			});

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
			).rejects.toStrictEqual({
				error: `Staking ledger could not be found for controller address "${testAddressController.toString()}"`,
				statusCode: 404,
			});

			(mockApi.query.staking.ledger as any).at = ledgerAt;
		});
	});
});
