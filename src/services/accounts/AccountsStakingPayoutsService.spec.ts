import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { u32 } from '@polkadot/types';
import { Hash, EraIndex, AccountId32 } from '@polkadot/types/interfaces';

import { defaultMockApi } from '../test-helpers/mock';
import { AccountsStakingPayoutsService } from './AccountsStakingPayoutsService';

const historyDepthAt = () => 
	Promise.resolve().then(() => {

	});
	
const erasRewardPointsAt = (_eraIndex: EraIndex) =>
	Promise.resolve().then(() => {

	});

const erasValidatorRewardAt = (_eraIndex: EraIndex) =>
	Promise.resolve().then(() => {

	});

const erasValidatorPrefsAt = (_era: u32 | number, _validatorId: string | AccountId32) => 
	Promise.resolve().then(() => {

	});

const bondedAt = (_validatorId: string | AccountId32) =>
	Promise.resolve().then(() => {

	});

const deriveEraExposure = (_eraIndex: EraIndex) => 
	Promise.resolve().then(() => {

	});

const mockHistoricApi = {
	query: {
		staking: {
			erasRewardPoints: erasRewardPointsAt,
			erasValidatorReward: erasValidatorRewardAt,
			historyDepth: historyDepthAt,
			erasValidatorPrefs: erasValidatorPrefsAt,
			bonded: bondedAt,
		}
	},
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...defaultMockApi,
	derive: {
		staking: {
			eraExposure: deriveEraExposure,
		},
	},
	at: (_hash: Hash) => mockHistoricApi,
} as unknown as ApiPromise;

const stakingPayoutsService = new AccountsStakingPayoutsService(mockApi);

describe('', () => {
	stakingPayoutsService;
});
