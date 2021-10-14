import { ApiPromise } from '@polkadot/api';
import { Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotMetadataRpcV9110 } from '../../test-helpers/metadata/polkadotV9110Metadata';
import { polkadotRegistry } from '../../test-helpers/registries';
import {
	createApiWithAugmentations,
	TypeFactory,
} from '../../test-helpers/typeFactory';
import {
	blockHash789629,
	defaultMockApi,
	testAddress,
} from '../test-helpers/mock';
import response789629 from '../test-helpers/responses/accounts/vestingInfo789629.json';
import { AccountsVestingInfoService } from './AccountsVestingInfoService';

const typeFactorApiV9110 = createApiWithAugmentations(polkadotMetadataRpcV9110);
const factory = new TypeFactory(typeFactorApiV9110);

const vestingRes = {
	locked: '1749990000000000',
	perBlock: '166475460',
	startingBlock: '4961000',
};

const vestingAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() => {
		const vestingInfo = typeFactorApiV9110.createType(
			'PalletVestingVestingInfo',
			vestingRes
		);
		const vecVestingInfo = factory.vecOf([vestingInfo]);

		return factory.optionOf(vecVestingInfo);
	});

const historicVestingAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<VestingInfo>', vestingRes)
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
		it('works when ApiPromise works (block 789629) with V14 metadata', async () => {
			expect(
				sanitizeNumbers(
					await accountsVestingInfoService.fetchAccountVestingInfo(
						blockHash789629,
						testAddress
					)
				)
			).toStrictEqual(response789629);
		});

		it('Vesting should return an empty array for None responses', async () => {
			const tempVest = () =>
				Promise.resolve().then(() =>
					polkadotRegistry.createType('Option<VestingInfo>', null)
				);
			(mockApi.query.vesting.vesting.at as unknown) = tempVest;

			const expectedResponse = {
				at: {
					hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
					height: '789629',
				},
				vesting: [],
			};

			expect(
				sanitizeNumbers(
					await accountsVestingInfoService.fetchAccountVestingInfo(
						blockHash789629,
						testAddress
					)
				)
			).toStrictEqual(expectedResponse);
			(mockApi.query.vesting.vesting.at as unknown) = vestingAt;
		});

		it('Should correctly adjust `Option<VestingInfo>` for pre V14 blocks to return an array', async () => {
			(mockApi.query.vesting.vesting.at as unknown) = historicVestingAt;
			expect(
				sanitizeNumbers(
					await accountsVestingInfoService.fetchAccountVestingInfo(
						blockHash789629,
						testAddress
					)
				)
			).toStrictEqual(response789629);
			(mockApi.query.vesting.vesting.at as unknown) = vestingAt;
		});
	});
});
