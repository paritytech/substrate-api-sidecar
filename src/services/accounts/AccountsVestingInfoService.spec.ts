import { ApiPromise } from '@polkadot/api';
import { Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistry } from '../../test-helpers/registries';
import {
	blockHash789629,
	defaultMockApi,
	testAddress,
} from '../test-helpers/mock';
import response789629 from '../test-helpers/responses/accounts/vestingInfo789629.json';
import { AccountsVestingInfoService } from './AccountsVestingInfoService';

const vestingAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<VestingInfo>', null)
	);

const mockApi = {
	...defaultMockApi,
	query: {
		vesting: {
			vesting: { at: vestingAt },
		},
	},
} as unknown as ApiPromise;

const accountsVestingInfoService = new AccountsVestingInfoService(mockApi);

describe('AccountVestingInfoService', () => {
	describe('fetchAccountVestingInfo', () => {
		it('works when ApiPromise works (block 789629)', async () => {
			expect(
				sanitizeNumbers(
					await accountsVestingInfoService.fetchAccountVestingInfo(
						blockHash789629,
						testAddress
					)
				)
			).toStrictEqual(response789629);
		});
	});
});
