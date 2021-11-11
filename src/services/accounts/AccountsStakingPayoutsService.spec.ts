import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { Hash } from '@polkadot/types/interfaces';

import { defaultMockApi } from '../test-helpers/mock';
import { AccountsStakingPayoutsService } from './AccountsStakingPayoutsService';

const mockHistoricApi = {} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

const stakingPayoutsService = new AccountsStakingPayoutsService(mockApi);

describe('', () => {
	stakingPayoutsService;
});
