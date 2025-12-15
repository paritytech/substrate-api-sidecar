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

import BN from 'bn.js';

/**
 * Represents a vesting schedule with the essential fields needed for calculations.
 */
export interface IVestingSchedule {
	/** Total amount of tokens locked at the start of vesting */
	locked: BN;
	/** Number of tokens that unlock per block */
	perBlock: BN;
	/** Block number when vesting/unlocking begins */
	startingBlock: BN;
}

/**
 * Result of vesting calculation for a single schedule.
 */
export interface IVestingCalculationResult {
	/** Amount that has vested and can be unlocked */
	unlockable: BN;
	/** Block number when vesting will be complete */
	endBlock: BN;
}

/**
 * Calculate the amount that can be unlocked (vested) for a single vesting schedule.
 *
 * The calculation follows the formula used in the vesting pallet:
 * - If currentBlock <= startingBlock: nothing is vested yet
 * - Otherwise: vested = min(blocksPassed * perBlock, locked)
 *
 * @param currentBlock - The block number to calculate unlockable amount at
 * @param schedule - The vesting schedule containing locked, perBlock, and startingBlock
 * @returns The amount that can be unlocked at the given block
 */
export const calculateUnlockable = (currentBlock: BN, schedule: IVestingSchedule): BN => {
	const { locked, perBlock, startingBlock } = schedule;

	// Vesting hasn't started yet
	if (currentBlock.lte(startingBlock)) {
		return new BN(0);
	}

	// Calculate how many blocks have passed since vesting started
	const blocksPassed = currentBlock.sub(startingBlock);

	// Calculate vested amount: blocksPassed * perBlock
	const vested = blocksPassed.mul(perBlock);

	// Return the minimum of vested and locked (can't unlock more than was locked)
	return BN.min(vested, locked);
};

/**
 * Calculate the block number when a vesting schedule will be fully vested.
 *
 * The end block is calculated as: startingBlock + (locked / perBlock)
 *
 * @param schedule - The vesting schedule
 * @returns The block number when vesting completes
 */
export const calculateEndBlock = (schedule: IVestingSchedule): BN => {
	const { locked, perBlock, startingBlock } = schedule;

	// Handle edge case where perBlock is 0 (would cause division by zero)
	if (perBlock.isZero()) {
		// If nothing unlocks per block, vesting never ends
		// Return a very large number to indicate "never"
		return new BN(Number.MAX_SAFE_INTEGER);
	}

	// endBlock = startingBlock + ceil(locked / perBlock)
	// Using div for integer division, then add 1 if there's a remainder
	const blocksNeeded = locked.div(perBlock);
	const hasRemainder = !locked.mod(perBlock).isZero();

	return startingBlock.add(blocksNeeded).add(hasRemainder ? new BN(1) : new BN(0));
};

/**
 * Calculate the total unlockable amount across multiple vesting schedules.
 *
 * @param currentBlock - The block number to calculate unlockable amounts at
 * @param schedules - Array of vesting schedules
 * @returns The total amount that can be unlocked across all schedules
 */
export const calculateTotalUnlockable = (currentBlock: BN, schedules: IVestingSchedule[]): BN => {
	return schedules.reduce((total, schedule) => {
		return total.add(calculateUnlockable(currentBlock, schedule));
	}, new BN(0));
};

/**
 * Calculate unlockable amounts for multiple schedules, returning per-schedule results.
 *
 * @param currentBlock - The block number to calculate unlockable amounts at
 * @param schedules - Array of vesting schedules
 * @returns Array of calculation results with unlockable amount and end block for each schedule
 */
export const calculateVestingDetails = (
	currentBlock: BN,
	schedules: IVestingSchedule[],
): IVestingCalculationResult[] => {
	return schedules.map((schedule) => ({
		unlockable: calculateUnlockable(currentBlock, schedule),
		endBlock: calculateEndBlock(schedule),
	}));
};
