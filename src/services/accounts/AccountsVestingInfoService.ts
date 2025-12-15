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

import { VestingInfo } from '@polkadot/types/interfaces';
import { BlockHash } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { BadRequest, InternalServerError } from 'http-errors';
import { BlockNumberSource, IAccountVestingInfo, IVestingSchedule } from 'src/types/responses';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { assetHubSpecNames } from '../../chains-config';
import { getInclusionBlockNumber } from '../../util/relay/getRelayParentNumber';
import { calculateTotalUnlockable, calculateUnlockable, IVestingSchedule as IVestingCalcSchedule } from '../../util/vesting/vestingCalculations';
import { AbstractService } from '../AbstractService';
import { MIGRATION_BOUNDARIES, relayToSpecMapping } from '../consts';

/**
 * Migration state for vesting calculations
 */
type MigrationState = 'pre-migration' | 'during-migration' | 'post-migration';

/**
 * Asset Hub parachain ID on relay chains
 */
const ASSET_HUB_PARA_ID = 1000;

export class AccountsVestingInfoService extends AbstractService {
	/**
	 * Fetch vesting information for an account at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address address of the account to get the vesting info of
	 */
	async fetchAccountVestingInfo(hash: BlockHash, address: string): Promise<IAccountVestingInfo> {
		const { api } = this;

		const historicApi = await api.at(hash);

		if (!historicApi.query.vesting) {
			throw new BadRequest(`Vesting pallet does not exist on the specified blocks runtime version`);
		}

		const [{ number }, vesting] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.vesting.vesting(address),
		]).catch((err: Error) => {
			throw this.createHttpErrorForAddr(address, err);
		});

		const blockNumber = number.unwrap().toNumber();

		const at = {
			hash,
			height: blockNumber.toString(10),
		};

		if (vesting.isNone) {
			return {
				at,
				vesting: [],
			};
		}

		const unwrapVesting = vesting.unwrap();
		const vestingArray: VestingInfo[] = Array.isArray(unwrapVesting) ? unwrapVesting : [unwrapVesting];

		// Calculate unlockable amounts based on chain type and migration state
		const unlockableResult = await this.calculateVestingUnlockable(hash, blockNumber, vestingArray);

		if (unlockableResult === null) {
			// Unable to calculate unlockable (e.g., during migration or missing relay connection)
			// Return raw vesting data without unlockable calculations
			return {
				at,
				vesting: vestingArray,
			};
		}

		return {
			at,
			vesting: unlockableResult.schedules,
			totalUnlockable: unlockableResult.totalUnlockable,
			blockNumberForCalculation: unlockableResult.blockNumberForCalculation,
			blockNumberSource: unlockableResult.blockNumberSource,
		};
	}

	/**
	 * Calculate unlockable amounts for vesting schedules.
	 * Returns null if calculation cannot be performed (e.g., during migration window).
	 */
	private async calculateVestingUnlockable(
		hash: BlockHash,
		blockNumber: number,
		vestingArray: VestingInfo[],
	): Promise<{
		schedules: IVestingSchedule[];
		totalUnlockable: string;
		blockNumberForCalculation: string;
		blockNumberSource: BlockNumberSource;
	} | null> {
		const specName = this.specName;
		const isAssetHub = assetHubSpecNames.has(specName);

		if (isAssetHub) {
			return this.calculateForAssetHub(hash, blockNumber, vestingArray);
		} else {
			return this.calculateForRelayChain(blockNumber, vestingArray);
		}
	}

	/**
	 * Calculate unlockable for Asset Hub chains.
	 * Post-migration: uses relay chain inclusion block number for calculations.
	 */
	private async calculateForAssetHub(
		hash: BlockHash,
		blockNumber: number,
		vestingArray: VestingInfo[],
	): Promise<{
		schedules: IVestingSchedule[];
		totalUnlockable: string;
		blockNumberForCalculation: string;
		blockNumberSource: BlockNumberSource;
	} | null> {
		const specName = this.specName;
		const boundaries = MIGRATION_BOUNDARIES[specName];

		if (!boundaries) {
			// No migration boundaries defined for this Asset Hub - can't calculate
			return null;
		}

		const migrationState = this.getAssetHubMigrationState(blockNumber, boundaries);

		if (migrationState === 'during-migration') {
			// During migration window, return 0 for unlockable
			return this.createZeroUnlockableResult(vestingArray, blockNumber.toString(), 'self');
		}

		if (migrationState === 'pre-migration') {
			// Pre-migration: vesting didn't exist on Asset Hub
			return null;
		}

		// Post-migration: need relay chain inclusion block number
		const relayApis = ApiPromiseRegistry.getApiByType('relay');
		if (relayApis.length === 0) {
			throw new InternalServerError(
				'Relay chain connection required for vesting calculations on Asset Hub post-migration. ' +
				'Please configure MULTI_CHAIN_URL with a relay chain endpoint.',
			);
		}

		const rcApi = relayApis[0].api;

		// Get the relay chain inclusion block number for this Asset Hub block
		const inclusionResult = await getInclusionBlockNumber(
			this.api,
			rcApi,
			hash,
			ASSET_HUB_PARA_ID,
		);

		if (!inclusionResult.found || inclusionResult.inclusionBlockNumber === null) {
			// Inclusion not found within search depth
			// Fall back to relay parent number for calculation
			return this.performCalculation(vestingArray, new BN(inclusionResult.relayParentNumber), 'relay');
		}

		return this.performCalculation(vestingArray, new BN(inclusionResult.inclusionBlockNumber), 'relay');
	}

	/**
	 * Calculate unlockable for relay chains.
	 * Pre-migration: uses the chain's own block number for calculations.
	 */
	private calculateForRelayChain(
		blockNumber: number,
		vestingArray: VestingInfo[],
	): {
		schedules: IVestingSchedule[];
		totalUnlockable: string;
		blockNumberForCalculation: string;
		blockNumberSource: BlockNumberSource;
	} | null {
		const specName = this.specName;
		const assetHubSpec = relayToSpecMapping.get(specName);

		if (!assetHubSpec) {
			// Not a known relay chain with migration boundaries
			// Use single-chain calculation
			return this.performCalculation(vestingArray, new BN(blockNumber), 'self');
		}

		const boundaries = MIGRATION_BOUNDARIES[assetHubSpec];

		if (!boundaries) {
			// No boundaries defined, use single-chain calculation
			return this.performCalculation(vestingArray, new BN(blockNumber), 'self');
		}

		const migrationState = this.getRelayChainMigrationState(blockNumber, boundaries);

		if (migrationState === 'during-migration') {
			// During migration window, return 0 for unlockable
			return this.createZeroUnlockableResult(vestingArray, blockNumber.toString(), 'self');
		}

		if (migrationState === 'post-migration') {
			// Post-migration: vesting no longer exists on relay chain
			// Return 0 for unlockable since vesting has migrated
			return this.createZeroUnlockableResult(vestingArray, blockNumber.toString(), 'self');
		}

		// Pre-migration: use relay chain's own block number
		return this.performCalculation(vestingArray, new BN(blockNumber), 'self');
	}

	/**
	 * Perform the actual unlockable calculation for vesting schedules.
	 */
	private performCalculation(
		vestingArray: VestingInfo[],
		currentBlock: BN,
		source: BlockNumberSource,
	): {
		schedules: IVestingSchedule[];
		totalUnlockable: string;
		blockNumberForCalculation: string;
		blockNumberSource: BlockNumberSource;
	} {
		// Convert VestingInfo to calculation interface
		const calcSchedules: IVestingCalcSchedule[] = vestingArray.map((v) => ({
			locked: new BN(v.locked.toString()),
			perBlock: new BN(v.perBlock.toString()),
			startingBlock: new BN(v.startingBlock.toString()),
		}));

		// Calculate unlockable for each schedule
		const schedules: IVestingSchedule[] = vestingArray.map((v, idx) => ({
			locked: v.locked.toString(),
			perBlock: v.perBlock.toString(),
			startingBlock: v.startingBlock.toString(),
			unlockable: calculateUnlockable(currentBlock, calcSchedules[idx]).toString(),
		}));

		const totalUnlockable = calculateTotalUnlockable(currentBlock, calcSchedules);

		return {
			schedules,
			totalUnlockable: totalUnlockable.toString(),
			blockNumberForCalculation: currentBlock.toString(),
			blockNumberSource: source,
		};
	}

	/**
	 * Create a result with zero unlockable for all schedules.
	 * Used during migration windows or post-migration on relay chain.
	 */
	private createZeroUnlockableResult(
		vestingArray: VestingInfo[],
		blockNumber: string,
		source: BlockNumberSource,
	): {
		schedules: IVestingSchedule[];
		totalUnlockable: string;
		blockNumberForCalculation: string;
		blockNumberSource: BlockNumberSource;
	} {
		const schedules: IVestingSchedule[] = vestingArray.map((v) => ({
			locked: v.locked.toString(),
			perBlock: v.perBlock.toString(),
			startingBlock: v.startingBlock.toString(),
			unlockable: '0',
		}));

		return {
			schedules,
			totalUnlockable: '0',
			blockNumberForCalculation: blockNumber,
			blockNumberSource: source,
		};
	}

	/**
	 * Determine migration state for an Asset Hub block.
	 */
	private getAssetHubMigrationState(
		blockNumber: number,
		boundaries: { assetHubMigrationStartedAt: number; assetHubMigrationEndedAt: number },
	): MigrationState {
		if (blockNumber < boundaries.assetHubMigrationStartedAt) {
			return 'pre-migration';
		} else if (blockNumber >= boundaries.assetHubMigrationEndedAt) {
			return 'post-migration';
		} else {
			return 'during-migration';
		}
	}

	/**
	 * Determine migration state for a relay chain block.
	 */
	private getRelayChainMigrationState(
		blockNumber: number,
		boundaries: { relayMigrationStartedAt: number; relayMigrationEndedAt: number },
	): MigrationState {
		if (blockNumber < boundaries.relayMigrationStartedAt) {
			return 'pre-migration';
		} else if (blockNumber >= boundaries.relayMigrationEndedAt) {
			return 'post-migration';
		} else {
			return 'during-migration';
		}
	}
}
