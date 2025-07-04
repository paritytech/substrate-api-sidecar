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
import { u32, Vec } from '@polkadot/types-codec';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';
import { IPalletStakingProgress } from 'src/types/responses';

import { ApiPromiseRegistry } from '../../../src/apiRegistry';
import { AbstractService } from '../AbstractService';

export class PalletsStakingProgressService extends AbstractService {
	/**
	 * Fetch and derive generalized staking information at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async derivePalletStakingProgress(hash: BlockHash): Promise<IPalletStakingProgress> {
		const { api } = this;
		const blockHead = await api.rpc.chain.getFinalizedHead();
		const isHead = blockHead.hash.toHex() === hash.hash.toHex();
		// if at head and connected to RC, connect to AH, else continue
		// specName will be the one of the main connection, compare to get the right API to use
		// session is always on relay chain
		// staking is on AH

		if (this.assetHubInfo.isAssetHub && !isHead) {
			throw new Error('At is currently unsupported for pallet staking validators connected to assethub');
		}
		const RCApiPromise = this.assetHubInfo.isAssetHub ? ApiPromiseRegistry.getApiByType('relay') : null;

		if (this.assetHubInfo.isAssetHub && !RCApiPromise?.length) {
			throw new Error('Relay chain API not found');
		}

		const historicApi = await api.at(hash);

		if (historicApi.query.staking === undefined) {
			throw new Error('Staking pallet not found for queried runtime');
		}
		const sessionValidators = this.assetHubInfo.isAssetHub
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

		const [eraElectionStatus, { eraLength, eraProgress, sessionLength, sessionProgress, activeEra }] =
			await Promise.all([eraElectionPromise, this.deriveSessionAndEraProgress(historicApi, RCApiPromise?.[0].api)]);

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
	 * Derive information on the progress of the current session and era.
	 *
	 * @param api ApiPromise with ensured metadata
	 * @param hash `BlockHash` to make call at
	 */
	private async deriveSessionAndEraProgress(
		historicApi: ApiDecoration<'promise'>,
		RCApi?: ApiDecoration<'promise'>,
	): Promise<{
		eraLength: BN;
		eraProgress: BN;
		sessionLength: BN;
		sessionProgress: BN;
		activeEra: EraIndex;
	}> {
		const babe = RCApi ? RCApi.query.babe : historicApi.query.babe;
		let session = historicApi.query.session;
		if (RCApi) {
			session = RCApi.query.session;
		}

		const [currentSlot, epochIndex, genesisSlot, currentIndex, activeEraOption] = await Promise.all([
			babe.currentSlot(),
			babe.epochIndex(),
			babe.genesisSlot(),
			session.currentIndex(),
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

		const { epochDuration: sessionLength } = RCApi ? RCApi.consts.babe : historicApi.consts.babe;
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
}
