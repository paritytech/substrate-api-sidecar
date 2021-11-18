import { BTreeMap } from '@polkadot/types';

/** Used for StakingPayouts */
export const mockEraRewardPoints = {
	total: '968,380',
	individual: {
		'12JZr1HgK8w6zsbBj6oAEVRkvisn8j3MrkXugqtvc4E8uwLo': '3,360',
		'1HDgY7vpDjafR5NM8dbwm1b3Rrs4zATuSCHHbe7YgpKUKFw': '4,440',
	} as unknown as BTreeMap,
};
