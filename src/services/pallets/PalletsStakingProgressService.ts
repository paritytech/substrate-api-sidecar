import { ApiPromise } from '@polkadot/api';
import { BlockHash, EraIndex } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';
import { IPalletStakingProgress } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class PalletsStakingProgressService extends AbstractService {
	/**
	 * Fetch and derive generalized staking information at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async derivePalletStakingProgress(
		hash: BlockHash
	): Promise<IPalletStakingProgress> {
		const { api } = this;

		const [
			validatorCount,
			forceEra,
			eraElectionStatus,
			validators,
			{ number },
		] = await Promise.all([
			api.query.staking.validatorCount.at(hash),
			api.query.staking.forceEra.at(hash),
			api.query.staking.eraElectionStatus.at(hash),
			api.query.session.validators.at(hash),
			api.rpc.chain.getHeader(hash),
		]);

		const {
			eraLength,
			eraProgress,
			sessionLength,
			sessionProgress,
			activeEra,
		} = await this.deriveSessionAndEraProgress(api, hash);

		const unappliedSlashesAtActiveEra = await api.query.staking.unappliedSlashes.at(
			hash,
			activeEra
		);

		const currentBlockNumber = number.toBn();

		const nextSession = sessionLength
			.sub(sessionProgress)
			.add(currentBlockNumber);

		const baseResponse = {
			at: {
				hash: hash.toJSON(),
				height: currentBlockNumber.toString(10),
			},
			activeEra: activeEra.toString(10),
			forceEra: forceEra.toJSON(),
			nextSessionEstimate: nextSession.toString(10),
			unappliedSlashes: unappliedSlashesAtActiveEra.map((slash) =>
				slash.toJSON()
			),
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

		const electionLookAhead = await this.deriveElectionLookAhead(api, hash);

		const nextCurrentEra = nextActiveEra
			.sub(currentBlockNumber)
			.sub(sessionLength)
			.gt(new BN(0))
			? nextActiveEra.sub(sessionLength) // current era simply one session before active era
			: nextActiveEra.add(eraLength).sub(sessionLength); // we are in the last session of an active era

		let toggle;
		if (electionLookAhead.eq(new BN(0))) {
			// no offchain solutions accepted
			toggle = null;
		} else if (eraElectionStatus.isClose) {
			// election window is yet to open
			toggle = nextCurrentEra.sub(electionLookAhead);
		} else {
			// election window closes at the end of the current era
			toggle = nextCurrentEra;
		}

		return {
			...baseResponse,
			nextActiveEraEstimate: nextActiveEra.toString(10),
			electionStatus: {
				status: eraElectionStatus.toJSON(),
				toggleEstimate: toggle?.toString(10) ?? null,
			},
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
		api: ApiPromise,
		hash: BlockHash
	): Promise<{
		eraLength: BN;
		eraProgress: BN;
		sessionLength: BN;
		sessionProgress: BN;
		activeEra: EraIndex;
	}> {
		const [
			currentSlot,
			epochIndex,
			genesisSlot,
			currentIndex,
			activeEraOption,
		] = await Promise.all([
			api.query.babe.currentSlot.at(hash),
			api.query.babe.epochIndex.at(hash),
			api.query.babe.genesisSlot.at(hash),
			api.query.session.currentIndex.at(hash),
			api.query.staking.activeEra.at(hash),
		]);

		if (activeEraOption.isNone) {
			// TODO refactor to newer error type
			throw new InternalServerError(
				'ActiveEra is None when Some was expected.'
			);
		}
		const { index: activeEra } = activeEraOption.unwrap();

		const activeEraStartSessionIndexOption = await api.query.staking.erasStartSessionIndex.at(
			hash,
			activeEra
		);
		if (activeEraStartSessionIndexOption.isNone) {
			throw new InternalServerError(
				'EraStartSessionIndex is None when Some was expected.'
			);
		}
		const activeEraStartSessionIndex = activeEraStartSessionIndexOption.unwrap();

		const { epochDuration: sessionLength } = api.consts.babe;
		const eraLength = api.consts.staking.sessionsPerEra.mul(sessionLength);
		const epochStartSlot = epochIndex.mul(sessionLength).add(genesisSlot);
		const sessionProgress = currentSlot.sub(epochStartSlot);
		const eraProgress = currentIndex
			.sub(activeEraStartSessionIndex)
			.mul(sessionLength)
			.add(sessionProgress);

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
	private async deriveElectionLookAhead(
		api: ApiPromise,
		hash: BlockHash
	): Promise<BN> {
		if (api.consts.staking.electionLookahead) {
			return api.consts.staking.electionLookahead;
		}

		const { specName } = await api.rpc.state.getRuntimeVersion(hash);
		const { epochDuration } = api.consts.babe;

		// TODO - create a configurable epochDivisor env for a more generic solution
		const epochDurationDivisor =
			specName.toString() === 'polkadot'
				? new BN(16) // polkadot electionLookAhead = epochDuration / 16
				: new BN(4); // kusama, westend, `substrate/bin/node` electionLookAhead = epochDuration / 4

		return epochDuration.div(epochDurationDivisor);
	}
}
