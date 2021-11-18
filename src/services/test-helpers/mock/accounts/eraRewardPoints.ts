import { BTreeMap } from '@polkadot/types'

/** Used for StakingPayouts */
export const mockEraRewardPoints = {
	total: '968,380',
	individual: {
		'111B8CxcmnWbuDLyGvgUmRezDCK1brRZmvUuQ6SrFdMyc3S': 3280,
		'114SUbKCXjmb9czpWTtS3JANSmNRwVa4mmsMrWYpRG1kDH5': 2600,
	} as unknown as BTreeMap,
};
