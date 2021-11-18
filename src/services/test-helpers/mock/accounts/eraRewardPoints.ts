import { BTreeMap } from '@polkadot/types';

import { polkadotRegistryV9110 } from '../../../../test-helpers/registries';

const rewardOne = polkadotRegistryV9110.createType('u32', 3360);
const rewardTwo = polkadotRegistryV9110.createType('u32', 4440);
const mapToBe = new Map();
mapToBe.set('12JZr1HgK8w6zsbBj6oAEVRkvisn8j3MrkXugqtvc4E8uwLo', rewardOne);
mapToBe.set('1HDgY7vpDjafR5NM8dbwm1b3Rrs4zATuSCHHbe7YgpKUKFw', rewardTwo);
const bTree = new BTreeMap(
	polkadotRegistryV9110,
	'AccountId32',
	'u32',
	mapToBe
);

/** Used for StakingPayouts */
export const mockEraRewardPoints = {
	total: polkadotRegistryV9110.createType('u32', 968380),
	individual: bTree,
};
