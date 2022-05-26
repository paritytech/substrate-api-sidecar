// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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

import { BTreeMap } from '@polkadot/types';

import { polkadotRegistryV9110 } from '../../../../test-helpers/registries';

const rewardOne = polkadotRegistryV9110.createType('u32', 3360);
const rewardTwo = polkadotRegistryV9110.createType('u32', 4440);
const mockEraRewardsMap = new Map();
mockEraRewardsMap.set(
	'12JZr1HgK8w6zsbBj6oAEVRkvisn8j3MrkXugqtvc4E8uwLo',
	rewardOne
);
mockEraRewardsMap.set(
	'1HDgY7vpDjafR5NM8dbwm1b3Rrs4zATuSCHHbe7YgpKUKFw',
	rewardTwo
);
const bTree = new BTreeMap(
	polkadotRegistryV9110,
	'AccountId32',
	'u32',
	mockEraRewardsMap
);

/** Used for StakingPayouts */
export const mockEraRewardPoints = {
	total: polkadotRegistryV9110.createType('u32', 968380),
	individual: bTree,
};
