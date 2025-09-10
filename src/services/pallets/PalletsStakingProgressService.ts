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

import { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import { BlockHash, EraIndex } from '@polkadot/types/interfaces';
import { AnyJson, ITuple } from '@polkadot/types/types';
import { u32, u64, Vec } from '@polkadot/types-codec';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';
import { IPalletStakingProgress } from 'src/types/responses';

import { ApiPromiseRegistry } from '../../../src/apiRegistry';
import { assetHubToBabe } from '../../chains-config';
import { isBadStakingBlock } from '../../util/badStakingBlocks';
import { AbstractService } from '../AbstractService';

interface IStakingProgressOptions {
	isRcCall?: boolean;
}

export class PalletsStakingProgressService extends AbstractService {
	/**
	 * Fetch and derive generalized staking information at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async derivePalletStakingProgress(
		hash: BlockHash,
		options: IStakingProgressOptions = {},
	): Promise<IPalletStakingProgress> {
		const { api } = this;
		const RCApiPromise = this.assetHubInfo.isAssetHub ? ApiPromiseRegistry.getApiByType('relay') : null;

		if (this.assetHubInfo.isAssetHub && !RCApiPromise?.length) {
			throw new Error('Relay chain API not found');
		}

		const historicApi = await api.at(hash);

		if (historicApi.query.staking === undefined) {
			throw new Error('Staking pallet not found for queried runtime');
		}

		const sessionValidators =
			this.assetHubInfo.isAssetHub && !options.isRcCall
				? RCApiPromise![0].api.query.session.validators
				: historicApi.query.session.validators;

		if (!sessionValidators) {
			throw new Error('Session pallet not found for queried runtime');
		}
		const [validatorCount, forceEra, validators, { number }] = await Promise.all([
			historicApi.query.staking.validatorCount(),
			historicApi.query.staking.forceEra(),
			sessionValidators(),
			api.rpc.chain.getHeader(hash),
		]);

		if (isBadStakingBlock(this.specName, number.unwrap().toNumber())) {
			let chainName = this.specName;
			switch (this.specName) {
				case 'westmint':
					chainName = 'Westend Asset Hub';
					break;
			}

			throw new Error(
				`Post migration, there were some interruptions to staking on ${chainName}, Block ${number.unwrap().toString(10)} is in the list of known bad staking blocks in ${chainName}`,
			);
		}

		let eraElectionPromise;
		/**
		 * Polkadot runtimes v0.8.30 and above do not support eraElectionStatus, so we check
		 * to see if eraElectionStatus is mounted to the api, and if were running on a
		 * runtime less than v0.8.30 it will return a successful result. If it doesn't
		 * we do nothing and let `eraElectionStatus` stay undefined.
		 */
		if (historicApi.query.staking.eraElectionStatus) {
			eraElectionPromise = await historicApi.query.staking.eraElectionStatus();
		}

		let deriveSessionAndEra;
		if (this.assetHubInfo.isAssetHub && this.assetHubInfo.isAssetHubMigrated && !options.isRcCall) {
			deriveSessionAndEra = this.deriveSessionAndEraProgressAssetHub(historicApi, RCApiPromise?.[0].api);
		} else {
			deriveSessionAndEra = this.deriveSessionAndEraProgress(historicApi);
		}

		const [eraElectionStatus, { eraLength, eraProgress, sessionLength, sessionProgress, activeEra }] =
			await Promise.all([eraElectionPromise, deriveSessionAndEra]);

		const unappliedSlashesAtActiveEra = await historicApi.query.staking.unappliedSlashes.entries();

		const currentBlockNumber = number.toBn();

		const nextSession = sessionLength.sub(sessionProgress).add(currentBlockNumber);

		const baseResponse = {
			at: {
				hash: hash.toJSON(),
				height: currentBlockNumber.toString(10),
			},
			activeEra: activeEra.toString(10),
			forceEra: forceEra.toJSON(),
			nextSessionEstimate: nextSession.toString(10),
			unappliedSlashes: unappliedSlashesAtActiveEra.toString()
				? unappliedSlashesAtActiveEra[0][1].map((slash) => slash.toJSON())
				: ([] as AnyJson[]),
		};

		if (forceEra.isForceNone) {
			// Most likely we are in a PoA network with no elections. Things
			// like `ValidatorCount` and `Validators` are hardcoded from genesis
			// to support a transition into NPoS, but are irrelevant here and would be
			// confusing to include. Thus, we craft a response excluding those values.
			return baseResponse;
		}

		const nextActiveEra = forceEra.isForceAlways
			? nextSession // there is a new era every session
			: eraLength.sub(eraProgress).add(currentBlockNumber); // the nextActiveEra is at the end of this era

		const electionLookAhead = await this.deriveElectionLookAhead(historicApi, RCApiPromise?.[0].api);

		const nextCurrentEra = nextActiveEra.sub(currentBlockNumber).sub(sessionLength).gt(new BN(0))
			? nextActiveEra.sub(sessionLength) // current era simply one session before active era
			: nextActiveEra.add(eraLength).sub(sessionLength); // we are in the last session of an active era

		let toggle;
		if (electionLookAhead.eq(new BN(0))) {
			// no offchain solutions accepted
			toggle = null;
		} else if ((eraElectionStatus as { isClose?: boolean })?.isClose) {
			// election window is yet to open
			toggle = nextCurrentEra.sub(electionLookAhead);
		} else {
			// election window closes at the end of the current era
			toggle = nextCurrentEra;
		}

		return {
			...baseResponse,
			nextActiveEraEstimate: nextActiveEra.toString(10),
			electionStatus: eraElectionStatus
				? {
						status: eraElectionStatus.toJSON(),
						toggleEstimate: toggle?.toString(10) ?? null,
					}
				: 'Deprecated, see docs',
			idealValidatorCount: validatorCount.toString(10),
			validatorSet: validators.map((accountId) => accountId.toString()),
		};
	}

	/**
	 * Derive session and era progress for Asset Hub using time-based BABE calculations
	 *
	 * This method calculates session and era progress for Asset Hub by deriving all values
	 * from scratch using time-based BABE formulas. This approach is necessary because:
	 *
	 * 1. **Historical Support**: Asset Hub cannot access historical BABE pallet constants
	 *    from the relay chain, so we need to calculate everything from time
	 * 2. **Time-Based Nature**: BABE slots and epochs are purely time-based and can be
	 *    calculated deterministically without chain state
	 * 3. **Relay Chain Dependency**: Asset Hub needs to query the relay chain for
	 *    skipped epochs, but can calculate slots/epochs locally
	 *
	 * **Calculations:**
	 * - **Current Slot**: `timestamp / slot_duration` (6 seconds for all networks)
	 * - **Epoch Index**: `(current_slot - genesis_slot) / epoch_duration`
	 * - **Session Index**: Derived from epoch index using SkippedEpochs mapping
	 * - **Session Progress**: `current_slot - epoch_start_slot`
	 * - **Era Progress**: `(current_session - era_start_session) * session_length + session_progress`
	 *
	 * **Data Sources:**
	 * - **Time-based**: Current timestamp, hardcoded BABE parameters
	 * - **Chain state**: Active era, bonded eras, session index, skipped epochs
	 *
	 * @param historicApi - Asset Hub API for staking queries
	 * @param RCApi - Relay chain API for BABE queries (session index, skipped epochs)
	 * @returns Session and era progress information
	 */
	private async deriveSessionAndEraProgressAssetHub(
		historicApi: ApiDecoration<'promise'>,
		RCApi?: ApiDecoration<'promise'>,
	): Promise<{
		eraLength: BN;
		eraProgress: BN;
		sessionLength: BN;
		sessionProgress: BN;
		activeEra: EraIndex;
	}> {
		const [activeEraOption, activeEraStartSessionIndexVec, currentTimestamp, skippedEpochs] = await Promise.all([
			historicApi.query.staking.activeEra(),
			historicApi.query.staking.bondedEras<Vec<ITuple<[u32, u32]>>>(),
			historicApi.query.timestamp.now(),
			RCApi?.query.babe.skippedEpochs(),
		]);

		if (activeEraOption.isNone) {
			throw new InternalServerError('ActiveEra is None when Some was expected.');
		}

		const { index: activeEra } = activeEraOption.unwrap();

		let activeEraStartSessionIndex;
		for (const [era, idx] of activeEraStartSessionIndexVec) {
			if (era && era.eq(activeEra) && idx) {
				activeEraStartSessionIndex = idx;
			}
		}

		if (!activeEraStartSessionIndex) {
			throw new InternalServerError('EraStartSessionIndex is None when Some was expected.');
		}

		const specNameBabeValues = assetHubToBabe[this.specName];

		const eraLength = historicApi.consts.staking.sessionsPerEra.mul(specNameBabeValues.epochDuration);

		const currentSlot = currentTimestamp.div(specNameBabeValues.slotDurationMs);
		// Calculate epoch index: (current_slot - genesis_slot) / epoch_duration
		const epochIndex = currentSlot.sub(specNameBabeValues.genesisSlot).div(specNameBabeValues.epochDuration);
		const currentIndex = this.calculateSessionIndexFromSkippedEpochs(epochIndex, skippedEpochs);
		// Calculate epoch start slot
		const epochStartSlot = epochIndex.mul(specNameBabeValues.epochDuration).add(specNameBabeValues.genesisSlot);
		// Calculate session progress within current epoch
		const sessionProgress = currentSlot.sub(epochStartSlot);

		// Calculate era progress
		const eraProgress = currentIndex
			.sub(activeEraStartSessionIndex)
			.mul(specNameBabeValues.epochDuration)
			.add(sessionProgress);

		return {
			eraLength,
			eraProgress,
			sessionLength: specNameBabeValues.epochDuration,
			sessionProgress,
			activeEra,
		};
	}

	/**
	 * Derive information on the progress of the current session and era.
	 *
	 * @param api ApiPromise with ensured metadata
	 * @param hash `BlockHash` to make call at
	 */
	private async deriveSessionAndEraProgress(historicApi: ApiDecoration<'promise'>): Promise<{
		eraLength: BN;
		eraProgress: BN;
		sessionLength: BN;
		sessionProgress: BN;
		activeEra: EraIndex;
	}> {
		const [currentSlot, epochIndex, genesisSlot, currentIndex, activeEraOption] = await Promise.all([
			historicApi.query.babe.currentSlot(),
			historicApi.query.babe.epochIndex(),
			historicApi.query.babe.genesisSlot(),
			historicApi.query.session.currentIndex(),
			historicApi.query.staking.activeEra(),
		]);

		if (activeEraOption.isNone) {
			// TODO refactor to newer error type
			throw new InternalServerError('ActiveEra is None when Some was expected.');
		}
		const { index: activeEra } = activeEraOption.unwrap();

		const activeEraStartSessionIndexVec = await historicApi.query.staking.bondedEras<Vec<ITuple<[u32, u32]>>>();

		let activeEraStartSessionIndex;
		for (const [era, idx] of activeEraStartSessionIndexVec) {
			if (era && era.eq(activeEra) && idx) {
				activeEraStartSessionIndex = idx;
			}
		}

		if (!activeEraStartSessionIndex) {
			throw new InternalServerError('EraStartSessionIndex is None when Some was expected.');
		}

		const { epochDuration: sessionLength } = historicApi.consts.babe;
		const eraLength = historicApi.consts.staking.sessionsPerEra.mul(sessionLength);
		const epochStartSlot = epochIndex.mul(sessionLength).add(genesisSlot);
		const sessionProgress = currentSlot.sub(epochStartSlot);
		const eraProgress = currentIndex.sub(activeEraStartSessionIndex).mul(sessionLength).add(sessionProgress);

		return {
			eraLength,
			eraProgress,
			sessionLength,
			sessionProgress,
			activeEra,
		};
	}

	/**
	 * Get electionLookAhead as a const if available. Otherwise derive
	 * `electionLookAhead` based on the `specName` & `epochDuration`.
	 * N.B. Values are hardcoded based on `specName`s polkadot, kusama, and westend.
	 * There are no guarantees that this will return the expected values for
	 * other `specName`s.
	 *
	 * @param api ApiPromise with ensured metadata
	 * @param hash `BlockHash` to make call at
	 */
	private async deriveElectionLookAhead(historicApi: ApiDecoration<'promise'>, RCApi?: ApiPromise): Promise<BN> {
		if (historicApi.consts.staking.electionLookahead) {
			return historicApi.consts.staking.electionLookahead as unknown as BN;
		}
		let specName = this.specName;

		if (RCApi) {
			specName = await RCApi.rpc.state.getRuntimeVersion().then(({ specName }) => specName.toString());
		}

		const { epochDuration } = RCApi ? RCApi.consts.babe : historicApi.consts.babe;

		// TODO - create a configurable epochDivisor env for a more generic solution
		const epochDurationDivisor =
			specName.toString() === 'polkadot'
				? new BN(16) // polkadot electionLookAhead = epochDuration / 16
				: new BN(4); // kusama, westend, `substrate/bin/node` electionLookAhead = epochDuration / 4

		return epochDuration.div(epochDurationDivisor);
	}

	/**
	 * Calculate session index from epoch index using SkippedEpochs mapping
	 *
	 * In BABE consensus, epochs advance based on time and can be "skipped" if the chain
	 * is offline, but sessions (which represent authority set changes) must happen
	 * sequentially and cannot be skipped.
	 *
	 * When epochs are skipped, BABE stores the mapping in `SkippedEpochs` to track
	 * the permanent offset between epoch and session indices.
	 *
	 * **Example:**
	 * - Normal: Epoch 10 → Session 10, Epoch 11 → Session 11
	 * - Chain offline during epochs 12-15
	 * - After downtime: Epoch 16 → Session 12 (sessions 13-16 were "lost")
	 * - `SkippedEpochs` stores: [(16, 12)] indicating epoch 16 maps to session 12
	 * - Future epochs: Epoch 17 → Session 13, Epoch 18 → Session 14, etc.
	 *
	 * **Algorithm:**
	 * 1. Find the closest skipped epoch ≤ current epoch
	 * 2. Calculate permanent offset: `skipped_epoch - skipped_session`
	 * 3. Apply offset: `session_index = current_epoch - permanent_offset`
	 *
	 * @param epochIndex - Current epoch index (time-based)
	 * @param skippedEpochs - BABE SkippedEpochs storage: Vec<(u64, u32)> mapping epoch to session
	 * @returns Current session index that accounts for skipped epochs
	 */
	private calculateSessionIndexFromSkippedEpochs(epochIndex: BN, skippedEpochs?: Vec<ITuple<[u64, u32]>>): BN {
		if (!skippedEpochs || skippedEpochs.isEmpty) {
			// No skipped epochs - session index equals epoch index
			return epochIndex;
		}

		const skippedArray = skippedEpochs.toArray();
		skippedArray.sort((a, b) => a[0].toNumber() - b[0].toNumber());

		// Find the closest skipped epoch that's <= current epoch
		let closestSkippedEpoch: ITuple<[u64, u32]> | null = null;
		for (const skipped of skippedArray) {
			if (skipped[0].lte(epochIndex)) {
				closestSkippedEpoch = skipped;
			} else {
				break;
			}
		}

		if (!closestSkippedEpoch) {
			// No skipped epochs before current epoch - session = epoch
			return epochIndex;
		}

		// Calculate the permanent offset from the closest skipped epoch
		const [skippedEpochIndex, skippedSessionIndex] = closestSkippedEpoch;
		const permanentOffset = skippedEpochIndex.sub(skippedSessionIndex);
		// Apply the permanent offset to current epoch to get session index
		const sessionIndex = epochIndex.sub(permanentOffset);

		return sessionIndex;
	}
}
