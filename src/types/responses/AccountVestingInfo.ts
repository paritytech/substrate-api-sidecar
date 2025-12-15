// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { Option } from '@polkadot/types/codec';
import { VestingInfo } from '@polkadot/types/interfaces';

import { IAt } from '.';

/**
 * Vesting schedule with calculated vested amount.
 * Extends the base VestingInfo with additional computed fields.
 */
export interface IVestingSchedule {
	/** Total amount of tokens locked at the start of vesting */
	locked: string;
	/** Number of tokens that unlock per block */
	perBlock: string;
	/** Block number when vesting/unlocking begins */
	startingBlock: string;
	/** Amount that has vested based on time elapsed at the queried block */
	vested: string;
}

/**
 * Indicates which chain's block number was used for vesting calculations.
 * - 'relay': Relay chain block number (used for Asset Hub post-migration)
 * - 'self': The queried chain's own block number (used for relay chain pre-migration)
 */
export type BlockNumberSource = 'relay' | 'self';

export interface IAccountVestingInfo {
	at: IAt;
	/**
	 * Array of vesting schedules for the account.
	 * Can be raw VestingInfo from the pallet or enhanced IVestingSchedule with vested amounts.
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	vesting: Option<VestingInfo> | IVestingSchedule[] | {};
	/**
	 * Total amount that has vested across all schedules (sum of per-schedule vested).
	 * Only present when vesting calculations are performed.
	 */
	vestedBalance?: string;
	/**
	 * Total locked amount across all vesting schedules.
	 * Only present when vesting calculations are performed.
	 */
	vestingTotal?: string;
	/**
	 * Actual amount that can be claimed/unlocked right now.
	 * Calculated as: vestingLocked - (vestingTotal - vestedBalance)
	 * This accounts for previous claims that reduced the on-chain lock.
	 * Only present when vesting calculations are performed.
	 */
	vestedClaimable?: string;
	/**
	 * The block number used for calculating vested amounts.
	 * For Asset Hub post-migration, this is the relay chain block number.
	 * For relay chain pre-migration, this is the queried block number.
	 */
	blockNumberForCalculation?: string;
	/**
	 * Indicates which chain's block number was used for the calculation.
	 * 'relay' for Asset Hub post-migration, 'self' for relay chain pre-migration.
	 */
	blockNumberSource?: BlockNumberSource;
	/** Relay chain block hash (when using useRcBlock parameter) */
	rcBlockHash?: string;
	/** Relay chain block number (when using useRcBlock parameter) */
	rcBlockNumber?: string;
	/** Asset Hub timestamp (when using useRcBlock parameter) */
	ahTimestamp?: string;
}
