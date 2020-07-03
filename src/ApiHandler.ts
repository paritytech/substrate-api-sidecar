// Copyright 2017-2020 Parity Technologies (UK) Ltd.
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
import { CalcFee } from '@polkadot/calc-fee';
import { Metadata, Struct } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';
import { GenericCall } from '@polkadot/types/generic';
import {
	DispatchInfo,
	EraIndex,
	Hash,
	RuntimeDispatchInfo,
} from '@polkadot/types/interfaces';
import { BlockHash } from '@polkadot/types/interfaces/chain';
import { EventRecord } from '@polkadot/types/interfaces/system';
import { u32 } from '@polkadot/types/primitive';
import { Codec } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';
import * as BN from 'bn.js';

import * as errors from '../config/errors-en.json';
import {
	IAccountBalance,
	IAccountStakingSummary,
	IAccountVestingSummary,
	IBlock,
	ISanitizedCall,
	ISanitizedEvent,
	IStakingInfo,
	ITxConstructionMaterial,
} from './types/response_types';

export default class ApiHandler {
	// private wsUrl: string,
	private api: ApiPromise;
	private specVersion: u32;
	private txVersion: u32;

	constructor(api: ApiPromise) {
		this.api = api;
		// this.wsUrl = wsUrl;
		this.specVersion = api.createType('u32', -1);
		this.txVersion = api.createType('u32', -1);
	}

	async fetchBlock(hash: BlockHash): Promise<IBlock> {
		const api = await this.ensureMeta(hash);
		const [{ block }, events] = await Promise.all([
			api.rpc.chain.getBlock(hash),
			this.fetchEvents(api, hash),
		]);

		const { parentHash, number, stateRoot, extrinsicsRoot } = block.header;
		const parentParentHash = await (async function () {
			if (block.header.number.toNumber() > 1) {
				return (await api.rpc.chain.getHeader(parentHash)).parentHash;
			} else {
				return parentHash;
			}
		})();

		const onInitialize = { events: [] as ISanitizedEvent[] };
		const onFinalize = { events: [] as ISanitizedEvent[] };

		const header = await api.derive.chain.getHeader(hash);
		const authorId = header?.author;

		const logs = block.header.digest.logs.map((log) => {
			const { type, index, value } = log;

			return { type, index, value };
		});

		const defaultSuccess = typeof events === 'string' ? events : false;
		const extrinsics = block.extrinsics.map((extrinsic) => {
			const {
				method,
				nonce,
				signature,
				signer,
				isSigned,
				tip,
				args,
			} = extrinsic;
			const hash = u8aToHex(blake2AsU8a(extrinsic.toU8a(), 256));

			return {
				method: `${method.sectionName}.${method.methodName}`,
				signature: isSigned ? { signature, signer } : null,
				nonce,
				args,
				newArgs: this.parseGenericCall(method).args,
				tip,
				hash,
				info: {},
				events: [] as ISanitizedEvent[],
				success: defaultSuccess,
				// paysFee overrides to bool if `system.ExtrinsicSuccess|ExtrinsicFailed` event is present
				paysFee: null as null | boolean,
			};
		});

		const successEvent = 'system.ExtrinsicSuccess';
		const failureEvent = 'system.ExtrinsicFailed';

		if (Array.isArray(events)) {
			for (const record of events) {
				const { event, phase } = record;
				const sanitizedEvent = {
					method: `${event.section}.${event.method}`,
					data: event.data,
				};

				if (phase.isApplyExtrinsic) {
					const extrinsicIdx = phase.asApplyExtrinsic.toNumber();
					const extrinsic = extrinsics[extrinsicIdx];

					if (!extrinsic) {
						throw new Error(
							// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
							`Missing extrinsic ${extrinsicIdx} in block ${hash}`
						);
					}

					const method = `${event.section}.${event.method}`;

					if (method === successEvent) {
						extrinsic.success = true;
					}

					if (method === successEvent || method === failureEvent) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const sanitizedData = event.data.toJSON() as any[];

						for (const data of sanitizedData) {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							if (data && data.paysFee) {
								extrinsic.paysFee =
									// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
									data.paysFee === true ||
									// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
									data.paysFee === 'Yes';

								break;
							}
						}
					}

					extrinsic.events.push(sanitizedEvent);
				} else if (phase.isFinalization) {
					onFinalize.events.push(sanitizedEvent);
				} else if (phase.isInitialization) {
					onInitialize.events.push(sanitizedEvent);
				}
			}
		}

		// The genesis block is a special case with little information associated with it.
		if (parentHash.every((byte) => !byte)) {
			return {
				number,
				hash,
				parentHash,
				stateRoot,
				extrinsicsRoot,
				authorId,
				logs,
				onInitialize,
				extrinsics,
				onFinalize,
			};
		}

		const perByte = api.consts.transactionPayment.transactionByteFee;
		const extrinsicBaseWeight = api.consts.system.extrinsicBaseWeight;
		const multiplier = await api.query.transactionPayment.nextFeeMultiplier.at(
			parentHash
		);
		// The block where the runtime is deployed falsely proclaims it would
		// be already using the new runtime. This workaround therefore uses the
		// parent of the parent in order to determine the correct runtime under which
		// this block was produced.
		const version = await api.rpc.state.getRuntimeVersion(parentParentHash);
		const specName = version.specName.toString();
		const specVersion = version.specVersion.toNumber();
		const coefficients = api.consts.transactionPayment.weightToFee.map(
			function (c) {
				return {
					coeffInteger: c.coeffInteger.toString(),
					coeffFrac: c.coeffFrac,
					degree: c.degree,
					negative: c.negative,
				};
			}
		);
		const calcFee = CalcFee.from_params(
			coefficients,
			BigInt(extrinsicBaseWeight.toString()),
			multiplier.toString(),
			perByte.toString(),
			specName,
			specVersion
		);

		for (let idx = 0; idx < block.extrinsics.length; ++idx) {
			if (!extrinsics[idx].paysFee || !block.extrinsics[idx].isSigned) {
				continue;
			}

			if (calcFee === null || calcFee === undefined) {
				extrinsics[idx].info = {
					error: `Fee calculation not supported for ${specName}#${specVersion}`,
				};
				continue;
			}

			try {
				const xtEvents = extrinsics[idx].events;
				const completedEvent = xtEvents.find(
					(event) =>
						event.method === successEvent ||
						event.method === failureEvent
				);
				if (!completedEvent) {
					extrinsics[idx].info = {
						error:
							'Unable to find success or failure event for extrinsic',
					};

					continue;
				}

				const completedData = completedEvent.data;
				if (!completedData) {
					extrinsics[idx].info = {
						error:
							'Success or failure event for extrinsic does not contain expected data',
					};

					continue;
				}

				// both ExtrinsicSuccess and ExtrinsicFailed events have DispatchInfo
				// types as their final arg
				const weightInfo = completedData[
					completedData.length - 1
				] as DispatchInfo;
				if (!weightInfo.weight) {
					extrinsics[idx].info = {
						error:
							'Success or failure event for extrinsic does not specify weight',
					};

					continue;
				}

				const len = block.extrinsics[idx].encodedLength;
				const weight = weightInfo.weight;

				const partialFee = calcFee.calc_fee(
					BigInt(weight.toString()),
					len
				);

				extrinsics[idx].info = api.createType('RuntimeDispatchInfo', {
					weight,
					class: weightInfo.class,
					partialFee: partialFee,
				});
			} catch (err) {
				console.error(err);
				extrinsics[idx].info = { error: 'Unable to fetch fee info' };
			}
		}

		return {
			number,
			hash,
			parentHash,
			stateRoot,
			extrinsicsRoot,
			authorId,
			logs,
			onInitialize,
			extrinsics,
			onFinalize,
		};
	}

	async fetchBalance(
		hash: BlockHash,
		address: string
	): Promise<IAccountBalance> {
		const api = await this.ensureMeta(hash);

		const [header, locks, sysAccount] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.balances.locks.at(hash, address),
			api.query.system.account.at(hash, address),
		]);

		const account =
			sysAccount.data != null
				? sysAccount.data
				: await api.query.balances.account.at(hash, address);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		if (account && locks && sysAccount) {
			const { free, reserved, miscFrozen, feeFrozen } = account;
			const { nonce } = sysAccount;

			return {
				at,
				nonce,
				free,
				reserved,
				miscFrozen,
				feeFrozen,
				locks,
			};
		} else {
			throw {
				at,
				error: 'Account not found',
			};
		}
	}

	/**
	 * Fetch and derive generalized staking information at a specific block.
	 *
	 * @param hash BlockHash to make call at.
	 */
	async fetchStakingInfo(hash: BlockHash): Promise<IStakingInfo> {
		const api = await this.ensureMeta(hash);

		const [
			validatorCount,
			forceEra,
			eraElectionStatus,
			validators,
			{ number },
		] = await Promise.all([
			await api.query.staking.validatorCount.at(hash),
			await api.query.staking.forceEra.at(hash),
			await api.query.staking.eraElectionStatus.at(hash),
			await api.query.session.validators.at(hash),
			await api.rpc.chain.getHeader(hash),
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
	 *
	 * @param hash BlockHash to make call at.
	 * @param stash _Stash_ address.
	 */
	async fetchAddressStakingInfo(
		hash: BlockHash,
		stash: string
	): Promise<IAccountStakingSummary> {
		const api = await this.ensureMeta(hash);

		const [header, controllerOption] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.staking.bonded.at(hash, stash), // Option<AccountId> representing the controller
		]);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		if (controllerOption.isNone) {
			throw {
				error: `The address ${stash} is not a stash address.`,
				statusCode: 400,
			};
		}

		const controller = controllerOption.unwrap();

		const [
			stakingLedgerOption,
			rewardDestination,
			slashingSpansOption,
		] = await Promise.all([
			await api.query.staking.ledger.at(hash, controller),
			await api.query.staking.payee.at(hash, stash),
			await api.query.staking.slashingSpans.at(hash, stash),
		]);

		const stakingLedger = stakingLedgerOption.unwrapOr(null);

		if (stakingLedger === null) {
			// should never throw because by time we get here we know we have a bonded pair
			throw {
				error: `Staking ledger could not be found for controller address "${controller.toString()}"`,
				statusCode: 404,
			};
		}

		const numSlashingSpans = slashingSpansOption.isSome
			? slashingSpansOption.unwrap().prior.length + 1
			: 0;

		return {
			at,
			controller,
			rewardDestination,
			numSlashingSpans,
			staking: stakingLedger,
		};
	}

	async fetchVesting(
		hash: BlockHash,
		address: string
	): Promise<IAccountVestingSummary> {
		const api = await this.ensureMeta(hash);

		const [header, vesting] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.vesting.vesting.at(hash, address),
		]);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		return {
			at,
			// TODO unwrap this option and error check
			vesting: vesting.isNone ? {} : vesting,
		};
	}

	async fetchMetadata(hash: BlockHash): Promise<Metadata> {
		const api = await this.ensureMeta(hash);

		const metadata = await api.rpc.state.getMetadata(hash);

		return metadata;
	}

	async fetchClaimsInfo(
		hash: BlockHash,
		ethAddress: string
	): Promise<null | { type: string }> {
		const api = await this.ensureMeta(hash);
		const agreementType = await api.query.claims.signing.at(
			hash,
			ethAddress
		);
		if (agreementType.isEmpty) {
			return null;
		}

		return {
			type: agreementType.toString(),
		};
	}

	async fetchTxArtifacts(hash: BlockHash): Promise<ITxConstructionMaterial> {
		const api = await this.ensureMeta(hash);

		const [
			header,
			metadata,
			genesisHash,
			name,
			version,
		] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.rpc.state.getMetadata(hash),
			api.rpc.chain.getBlockHash(0),
			api.rpc.system.chain(),
			api.rpc.state.getRuntimeVersion(hash),
		]);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		return {
			at,
			genesisHash,
			chainName: name.toString(),
			specName: version.specName.toString(),
			specVersion: version.specVersion,
			txVersion: version.transactionVersion,
			metadata: metadata.toHex(),
		};
	}

	async fetchFeeInformation(
		hash: BlockHash,
		extrinsic: string
	): Promise<RuntimeDispatchInfo> {
		const api = await this.ensureMeta(hash);

		try {
			return await api.rpc.payment.queryInfo(extrinsic, hash);
		} catch (err) {
			throw {
				error: 'Unable to fetch fee info',
				data: {
					extrinsic,
					block: hash,
				},
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				cause: err.toString(),
			};
		}
	}

	async submitTx(extrinsic: string): Promise<{ hash: Hash }> {
		const api = await this.resetMeta();

		let tx;

		try {
			tx = api.tx(extrinsic);
		} catch (err) {
			throw {
				error: 'Failed to parse a tx',
				data: extrinsic,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				cause: err.toString(),
			};
		}

		try {
			const hash = await api.rpc.author.submitExtrinsic(tx);

			return {
				hash,
			};
		} catch (err) {
			throw {
				error: 'Failed to submit a tx',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				cause: err.toString(),
			};
		}
	}

	private async fetchEvents(
		api: ApiPromise,
		hash: BlockHash
	): Promise<EventRecord[] | string> {
		try {
			return await api.query.system.events.at(hash);
		} catch (_) {
			return 'Unable to fetch Events, cannot confirm extrinsic status. Check pruning settings on the node.';
		}
	}

	private async resetMeta(): Promise<ApiPromise> {
		const { api } = this;

		return await this.ensureMeta(await api.rpc.chain.getFinalizedHead());
	}

	private async ensureMeta(hash: BlockHash): Promise<ApiPromise> {
		const { api } = this;

		try {
			const version = await api.rpc.state.getRuntimeVersion(hash);
			const blockSpecVersion = version.specVersion;
			const blockTxVersion = version.transactionVersion;

			// Swap metadata if tx version is different. This block of code should never execute, as
			// specVersion always increases when txVersion increases, but specVersion may increase
			// without an increase in txVersion. Defensive only.
			if (
				!this.txVersion.eq(blockTxVersion) &&
				this.specVersion.eq(blockSpecVersion)
			) {
				console.warn('txVersion bumped without specVersion bumping');
				this.txVersion = blockTxVersion;
				const meta = await api.rpc.state.getMetadata(hash);
				api.registry.setMetadata(meta);
			}
			// Swap metadata and confirm txVersion if specVersion is different.
			else if (!this.specVersion.eq(blockSpecVersion)) {
				this.specVersion = blockSpecVersion;
				this.txVersion = blockTxVersion;
				const meta = await api.rpc.state.getMetadata(hash);
				const chain = await api.rpc.system.chain();

				api.registry.register(
					getSpecTypes(
						api.registry,
						chain,
						version.specName,
						blockSpecVersion
					)
				);
				api.registry.setMetadata(meta);
			}
		} catch (err) {
			console.error(
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				`Failed to get Metadata for block ${hash}, using latest.`
			);
			console.error(err);
			this.specVersion = api.createType('u32', -1);
			this.txVersion = api.createType('u32', -1);
		}

		return api;
	}

	private parseArrayGenericCalls(
		argsArray: Codec[]
	): (Codec | ISanitizedCall)[] {
		return argsArray.map((argument) => {
			if (argument instanceof GenericCall) {
				return this.parseGenericCall(argument);
			}

			return argument;
		});
	}

	private parseGenericCall(genericCall: GenericCall): ISanitizedCall {
		const { sectionName, methodName, callIndex } = genericCall;
		const newArgs = {};

		// Pull out the struct of arguments to this call
		const callArgs = genericCall.get('args') as Struct;

		// Make sure callArgs exists and we can access its keys
		if (callArgs && callArgs.defKeys) {
			// paramName is a string
			for (const paramName of callArgs.defKeys) {
				const argument = callArgs.get(paramName);

				if (Array.isArray(argument)) {
					newArgs[paramName] = this.parseArrayGenericCalls(argument);
				} else if (argument instanceof GenericCall) {
					newArgs[paramName] = this.parseGenericCall(argument);
				} else {
					newArgs[paramName] = argument;
				}
			}
		}

		return {
			method: `${sectionName}.${methodName}`,
			callIndex,
			args: newArgs,
		};
	}

	/**
	 * Derive information on the progress of the current session and era.
	 *
	 * @param api ApiPromise with ensured metadata.
	 * @param hash block hash to get info at.
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
			await api.query.babe.currentSlot.at(hash),
			await api.query.babe.epochIndex.at(hash),
			await api.query.babe.genesisSlot.at(hash),
			await api.query.session.currentIndex.at(hash),
			await api.query.staking.activeEra.at(hash),
		]);

		if (activeEraOption.isNone) {
			throw errors.ActiveEra_IS_NONE;
		}
		const { index: activeEra } = activeEraOption.unwrap();

		const activeEraStartSessionIndexOption = await api.query.staking.erasStartSessionIndex.at(
			hash,
			activeEra
		);
		if (activeEraStartSessionIndexOption.isNone) {
			throw errors.ErasStartSessionIndex_IS_NONE;
		}
		const activeEraStartSessionIndex = activeEraStartSessionIndexOption.unwrap();

		const { epochDuration: sessionLength } = api.consts.babe;
		const eraLength = api.consts.staking.sessionsPerEra.mul(sessionLength);
		const epochStartSlot = epochIndex.mul(sessionLength).add(genesisSlot);
		const sessionProgress = currentSlot.sub(epochStartSlot);
		const eraProgress = currentIndex
			.sub(activeEraStartSessionIndex as BN)
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
	 * @param api ApiPromise with ensured metadata.
	 * @param hash block hash to get info at.
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
