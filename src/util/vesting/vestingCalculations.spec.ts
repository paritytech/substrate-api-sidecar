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

import {
	calculateEndBlock,
	calculateTotalVested,
	calculateVested,
	calculateVestedClaimable,
	calculateVestingDetails,
	calculateVestingTotal,
	IVestingSchedule,
} from './vestingCalculations';

describe('Vesting Calculations', () => {
	// Sample vesting schedule based on real data from tests
	const sampleSchedule: IVestingSchedule = {
		locked: new BN('1749990000000000'),
		perBlock: new BN('166475460'),
		startingBlock: new BN('4961000'),
	};

	describe('calculateVested', () => {
		it('should return 0 when current block is before starting block', () => {
			const currentBlock = new BN('4960000'); // Before startingBlock
			const result = calculateVested(currentBlock, sampleSchedule);

			expect(result.toString()).toBe('0');
		});

		it('should return 0 when current block equals starting block', () => {
			const currentBlock = new BN('4961000'); // Equal to startingBlock
			const result = calculateVested(currentBlock, sampleSchedule);

			expect(result.toString()).toBe('0');
		});

		it('should return partial amount when vesting is in progress', () => {
			// 1000 blocks after start
			const currentBlock = new BN('4962000');
			const result = calculateVested(currentBlock, sampleSchedule);

			// Expected: 1000 * 166475460 = 166475460000
			const expected = new BN('166475460000');
			expect(result.toString()).toBe(expected.toString());
		});

		it('should return locked amount when fully vested', () => {
			// Far in the future, well past end block
			const currentBlock = new BN('100000000');
			const result = calculateVested(currentBlock, sampleSchedule);

			// Should be capped at locked amount
			expect(result.toString()).toBe(sampleSchedule.locked.toString());
		});

		it('should not exceed locked amount even with large block numbers', () => {
			const currentBlock = new BN('999999999999');
			const result = calculateVested(currentBlock, sampleSchedule);

			expect(result.lte(sampleSchedule.locked)).toBe(true);
			expect(result.toString()).toBe(sampleSchedule.locked.toString());
		});

		it('should handle schedule with small values', () => {
			const smallSchedule: IVestingSchedule = {
				locked: new BN('1000'),
				perBlock: new BN('10'),
				startingBlock: new BN('100'),
			};

			// 50 blocks after start: 50 * 10 = 500
			const currentBlock = new BN('150');
			const result = calculateVested(currentBlock, smallSchedule);

			expect(result.toString()).toBe('500');
		});

		it('should handle schedule where perBlock equals locked', () => {
			const quickVestSchedule: IVestingSchedule = {
				locked: new BN('1000'),
				perBlock: new BN('1000'),
				startingBlock: new BN('100'),
			};

			// 1 block after start should fully vest
			const currentBlock = new BN('101');
			const result = calculateVested(currentBlock, quickVestSchedule);

			expect(result.toString()).toBe('1000');
		});
	});

	describe('calculateEndBlock', () => {
		it('should calculate correct end block for sample schedule', () => {
			const result = calculateEndBlock(sampleSchedule);

			// endBlock = startingBlock + ceil(locked / perBlock)
			// locked / perBlock = 1749990000000000 / 166475460 = 10511999 remainder 130955460
			// Since there's a remainder, we round up: 10511999 + 1 = 10512000
			// endBlock = 4961000 + 10512000 = 15473000
			const expectedEndBlock = new BN('15473000');
			expect(result.toString()).toBe(expectedEndBlock.toString());
		});

		it('should handle exact division (no remainder)', () => {
			const exactSchedule: IVestingSchedule = {
				locked: new BN('1000'),
				perBlock: new BN('100'),
				startingBlock: new BN('500'),
			};

			// endBlock = 500 + (1000 / 100) = 500 + 10 = 510
			const result = calculateEndBlock(exactSchedule);
			expect(result.toString()).toBe('510');
		});

		it('should handle division with remainder (rounds up)', () => {
			const remainderSchedule: IVestingSchedule = {
				locked: new BN('1001'),
				perBlock: new BN('100'),
				startingBlock: new BN('500'),
			};

			// endBlock = 500 + ceil(1001 / 100) = 500 + 11 = 511
			const result = calculateEndBlock(remainderSchedule);
			expect(result.toString()).toBe('511');
		});

		it('should handle zero perBlock gracefully', () => {
			const zeroPerBlockSchedule: IVestingSchedule = {
				locked: new BN('1000'),
				perBlock: new BN('0'),
				startingBlock: new BN('500'),
			};

			const result = calculateEndBlock(zeroPerBlockSchedule);
			// Should return MAX_SAFE_INTEGER to indicate "never ends"
			expect(result.toString()).toBe(Number.MAX_SAFE_INTEGER.toString());
		});
	});

	describe('calculateTotalVested', () => {
		it('should return 0 for empty schedules array', () => {
			const currentBlock = new BN('5000000');
			const result = calculateTotalVested(currentBlock, []);

			expect(result.toString()).toBe('0');
		});

		it('should return correct total for single schedule', () => {
			const currentBlock = new BN('4962000'); // 1000 blocks after start
			const result = calculateTotalVested(currentBlock, [sampleSchedule]);

			// Expected: 1000 * 166475460 = 166475460000
			expect(result.toString()).toBe('166475460000');
		});

		it('should sum vested amounts from multiple schedules', () => {
			const schedules: IVestingSchedule[] = [
				{
					locked: new BN('1000'),
					perBlock: new BN('10'),
					startingBlock: new BN('100'),
				},
				{
					locked: new BN('2000'),
					perBlock: new BN('20'),
					startingBlock: new BN('100'),
				},
			];

			// At block 150 (50 blocks after start):
			// Schedule 1: 50 * 10 = 500
			// Schedule 2: 50 * 20 = 1000
			// Total: 1500
			const currentBlock = new BN('150');
			const result = calculateTotalVested(currentBlock, schedules);

			expect(result.toString()).toBe('1500');
		});

		it('should handle schedules with different starting blocks', () => {
			const schedules: IVestingSchedule[] = [
				{
					locked: new BN('1000'),
					perBlock: new BN('10'),
					startingBlock: new BN('100'),
				},
				{
					locked: new BN('2000'),
					perBlock: new BN('20'),
					startingBlock: new BN('200'), // Starts later
				},
			];

			// At block 150:
			// Schedule 1: 50 * 10 = 500 (started at 100)
			// Schedule 2: 0 (hasn't started, starts at 200)
			// Total: 500
			const currentBlock = new BN('150');
			const result = calculateTotalVested(currentBlock, schedules);

			expect(result.toString()).toBe('500');
		});

		it('should handle mix of fully vested and in-progress schedules', () => {
			const schedules: IVestingSchedule[] = [
				{
					locked: new BN('100'),
					perBlock: new BN('100'), // Fully vests in 1 block
					startingBlock: new BN('100'),
				},
				{
					locked: new BN('1000'),
					perBlock: new BN('10'),
					startingBlock: new BN('100'),
				},
			];

			// At block 150:
			// Schedule 1: min(50 * 100, 100) = 100 (fully vested)
			// Schedule 2: 50 * 10 = 500
			// Total: 600
			const currentBlock = new BN('150');
			const result = calculateTotalVested(currentBlock, schedules);

			expect(result.toString()).toBe('600');
		});
	});

	describe('calculateVestingTotal', () => {
		it('should return 0 for empty schedules array', () => {
			const result = calculateVestingTotal([]);
			expect(result.toString()).toBe('0');
		});

		it('should return locked amount for single schedule', () => {
			const result = calculateVestingTotal([sampleSchedule]);
			expect(result.toString()).toBe(sampleSchedule.locked.toString());
		});

		it('should sum locked amounts from multiple schedules', () => {
			const schedules: IVestingSchedule[] = [
				{
					locked: new BN('1000'),
					perBlock: new BN('10'),
					startingBlock: new BN('100'),
				},
				{
					locked: new BN('2000'),
					perBlock: new BN('20'),
					startingBlock: new BN('200'),
				},
			];

			const result = calculateVestingTotal(schedules);
			expect(result.toString()).toBe('3000');
		});
	});

	describe('calculateVestedClaimable', () => {
		it('should return 0 when nothing has vested', () => {
			const vestingLocked = new BN('1000');
			const vestingTotal = new BN('1000');
			const vestedBalance = new BN('0');

			const result = calculateVestedClaimable(vestingLocked, vestingTotal, vestedBalance);
			// claimable = 1000 - (1000 - 0) = 0
			expect(result.toString()).toBe('0');
		});

		it('should return correct claimable when partially vested', () => {
			const vestingLocked = new BN('1000');
			const vestingTotal = new BN('1000');
			const vestedBalance = new BN('400');

			const result = calculateVestedClaimable(vestingLocked, vestingTotal, vestedBalance);
			// claimable = 1000 - (1000 - 400) = 1000 - 600 = 400
			expect(result.toString()).toBe('400');
		});

		it('should return correct claimable when some has already been claimed', () => {
			// Example: 1000 locked, 400 vested, user already claimed 100
			const vestingLocked = new BN('900'); // 1000 - 100 already claimed
			const vestingTotal = new BN('1000');
			const vestedBalance = new BN('400');

			const result = calculateVestedClaimable(vestingLocked, vestingTotal, vestedBalance);
			// claimable = 900 - (1000 - 400) = 900 - 600 = 300
			expect(result.toString()).toBe('300');
		});

		it('should return 0 when fully claimed', () => {
			// All vested amount already claimed
			const vestingLocked = new BN('600'); // Original 1000, vested 400, all 400 claimed
			const vestingTotal = new BN('1000');
			const vestedBalance = new BN('400');

			const result = calculateVestedClaimable(vestingLocked, vestingTotal, vestedBalance);
			// claimable = 600 - (1000 - 400) = 600 - 600 = 0
			expect(result.toString()).toBe('0');
		});

		it('should return full amount when fully vested and nothing claimed', () => {
			const vestingLocked = new BN('1000');
			const vestingTotal = new BN('1000');
			const vestedBalance = new BN('1000'); // Fully vested

			const result = calculateVestedClaimable(vestingLocked, vestingTotal, vestedBalance);
			// claimable = 1000 - (1000 - 1000) = 1000 - 0 = 1000
			expect(result.toString()).toBe('1000');
		});

		it('should handle multiple schedules (aggregate values)', () => {
			// Two schedules: 1000 + 2000 = 3000 total locked
			// 400 + 800 = 1200 total vested
			// User claimed 200
			const vestingLocked = new BN('2800'); // 3000 - 200 claimed
			const vestingTotal = new BN('3000');
			const vestedBalance = new BN('1200');

			const result = calculateVestedClaimable(vestingLocked, vestingTotal, vestedBalance);
			// claimable = 2800 - (3000 - 1200) = 2800 - 1800 = 1000
			expect(result.toString()).toBe('1000');
		});

		it('should return 0 for negative result (edge case)', () => {
			// Edge case: vestingLocked is less than stillLocked (shouldn't happen normally)
			const vestingLocked = new BN('500');
			const vestingTotal = new BN('1000');
			const vestedBalance = new BN('400');

			const result = calculateVestedClaimable(vestingLocked, vestingTotal, vestedBalance);
			// claimable = 500 - (1000 - 400) = 500 - 600 = -100, capped at 0
			expect(result.toString()).toBe('0');
		});
	});

	describe('calculateVestingDetails', () => {
		it('should return empty array for empty schedules', () => {
			const currentBlock = new BN('5000000');
			const result = calculateVestingDetails(currentBlock, []);

			expect(result).toEqual([]);
		});

		it('should return details for single schedule', () => {
			const schedule: IVestingSchedule = {
				locked: new BN('1000'),
				perBlock: new BN('100'),
				startingBlock: new BN('500'),
			};

			const currentBlock = new BN('505'); // 5 blocks after start
			const result = calculateVestingDetails(currentBlock, [schedule]);

			expect(result.length).toBe(1);
			expect(result[0].vested.toString()).toBe('500'); // 5 * 100
			expect(result[0].endBlock.toString()).toBe('510'); // 500 + (1000/100)
		});

		it('should return details for multiple schedules', () => {
			const schedules: IVestingSchedule[] = [
				{
					locked: new BN('1000'),
					perBlock: new BN('100'),
					startingBlock: new BN('500'),
				},
				{
					locked: new BN('2000'),
					perBlock: new BN('200'),
					startingBlock: new BN('600'),
				},
			];

			const currentBlock = new BN('605'); // 105 blocks after schedule 1, 5 blocks after schedule 2
			const result = calculateVestingDetails(currentBlock, schedules);

			expect(result.length).toBe(2);

			// Schedule 1: fully vested (105 * 100 = 10500 > 1000)
			expect(result[0].vested.toString()).toBe('1000');
			expect(result[0].endBlock.toString()).toBe('510');

			// Schedule 2: 5 * 200 = 1000
			expect(result[1].vested.toString()).toBe('1000');
			expect(result[1].endBlock.toString()).toBe('610'); // 600 + (2000/200)
		});
	});
});
