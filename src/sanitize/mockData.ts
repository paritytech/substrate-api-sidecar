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

import { MAX_U64, MAX_U128 } from '../test-helpers/constants';
import { kusamaRegistry } from '../test-helpers/registries';

/**
 * An 'at' object, which has not been sanitized by `sanitizeNumbers`.
 */
export const PRE_SANITIZED_AT = {
	height: '2669784',
	hash: kusamaRegistry.createType('BlockHash', '0x5f2a8b33c24368148982c37aefe77d5724f5aca0bcae1a599e2a4634c1f0fab2'),
};

/**
 * A dummy return value to fetchStakingLedger which has not been run through `sanitizeNumbers`.
 */
export const PRE_SANITIZED_STAKING_RESPONSE = {
	at: PRE_SANITIZED_AT,
	staking: kusamaRegistry.createType('StakingLedger', {
		stash: '5DRihWfVSmhbk25D4VRSjacZTtrnv8w8qnGttLmfro5MCPgm',
		total: '0x0000000000000000ff49f24a6a9c00',
		active: '0x0000000000000000ff49f24a6a9100',
		unlocking: [],
		claimedRewards: [],
	}),
};

export const PRE_SANITIZED_BALANCE_LOCK = kusamaRegistry.createType('Vec<BalanceLock>', [
	{
		id: '00000000',
		amount: kusamaRegistry.createType('Balance', '0x0000000000000000ff49f24a6a9c00'),
		reasons: 'misc',
	},
]);

export const PRE_SANITIZED_OPTION_VESTING_INFO = kusamaRegistry.createType('Option<VestingInfo>', {
	locked: '0x0000000000000000ff49f24a6a9c00',
	perBlock: '0x0000000000000000ff49f24a6a9100',
	startingBlock: '299694200',
});

export const PRE_SANITIZED_RUNTIME_DISPATCH_INFO = kusamaRegistry.createType('RuntimeDispatchInfo', {
	weight: MAX_U64,
	class: 'operational',
	partialFee: MAX_U128,
});
