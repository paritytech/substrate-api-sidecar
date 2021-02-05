import { ApiPromise } from '@polkadot/api';
import { expandMetadata } from '@polkadot/metadata/decorate';
import { Compact, GenericCall, Struct } from '@polkadot/types';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import {
	AccountId,
	Block,
	BlockHash,
	BlockNumber,
	BlockWeights,
	Digest,
	DispatchInfo,
	EventRecord,
	Hash,
	WeightPerClass,
} from '@polkadot/types/interfaces';
import { AnyJson, Codec, Registry } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { CalcFee } from '@substrate/calc';
import { BadRequest } from 'http-errors';

import {
	IBlock,
	ICalcFee,
	IExtrinsic,
	IExtrinsicIndex,
	ISanitizedCall,
	ISanitizedEvent,
	isFrameMethod,
} from '../../types/responses';
import { isPaysFee } from '../../types/util';
import { AbstractService } from '../AbstractService';

/**
 * Types for fetchBlock's options
 * @field eventDocs
 * @field extrinsicDocs
 * @field checkFinalized Option to reduce rpc calls. Equals true when blockId is a hash.
 * @field queryFinalizedHead Option to reduce rpc calls. Equals true when finalized head has not been queried.
 * @field omitFinalizedTag Option to omit the finalized tag, and return it as undefined.
 */
interface FetchBlockOptions {
	eventDocs: boolean;
	extrinsicDocs: boolean;
	checkFinalized: boolean;
	queryFinalizedHead: boolean;
	omitFinalizedTag: boolean;
}

/**
 * Event methods that we check for.
 */
enum Event {
	success = 'ExtrinsicSuccess',
	failure = 'ExtrinsicFailed',
}

export class BlocksService extends AbstractService {
	/**
	 * Fetch a block augmented with derived values.
	 *
	 * @param hash `BlockHash` of the block to fetch.
	 */
	async fetchBlock(
		hash: BlockHash,
		{
			eventDocs,
			extrinsicDocs,
			checkFinalized,
			queryFinalizedHead,
			omitFinalizedTag,
		}: FetchBlockOptions
	): Promise<IBlock> {
		const { api } = this;

		let block, events, finalizedHead, sessionValidators;
		if (typeof api.query.session?.validators?.at === 'function') {
			[
				{ block },
				events,
				sessionValidators,
				finalizedHead,
			] = await Promise.all([
				api.rpc.chain.getBlock(hash),
				this.fetchEvents(api, hash),
				api.query.session.validators.at(hash),
				queryFinalizedHead
					? api.rpc.chain.getFinalizedHead()
					: Promise.resolve(hash),
			]);
		} else {
			[{ block }, events, finalizedHead] = await Promise.all([
				api.rpc.chain.getBlock(hash),
				this.fetchEvents(api, hash),
				queryFinalizedHead
					? api.rpc.chain.getFinalizedHead()
					: Promise.resolve(hash),
			]);
		}

		const {
			parentHash,
			number,
			stateRoot,
			extrinsicsRoot,
			digest,
		} = block.header;

		const authorId = sessionValidators
			? this.extractAuthor(sessionValidators, digest)
			: undefined;

		const logs = digest.logs.map(({ type, index, value }) => {
			return { type, index, value };
		});

		const nonSanitizedExtrinsics = this.extractExtrinsics(
			block,
			events,
			extrinsicDocs
		);

		const { extrinsics, onInitialize, onFinalize } = this.sanitizeEvents(
			events,
			nonSanitizedExtrinsics,
			hash,
			eventDocs
		);

		let finalized = undefined;

		if (!omitFinalizedTag) {
			// Check if the requested block is finalized
			finalized = await this.isFinalizedBlock(
				api,
				number,
				hash,
				finalizedHead,
				checkFinalized
			);
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
				finalized,
			};
		}

		const {
			calcFee,
			specName,
			specVersion,
			decorated,
			runtimeDoesNotMatch,
		} = await this.createCalcFee(api, parentHash, block);

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
					({ method }) =>
						isFrameMethod(method) &&
						(method.method === Event.success ||
							method.method === Event.failure)
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

				// The Dispatch class used to key into `blockWeights.perClass`
				// We set default to be normal.
				let weightInfoClass = 'normal';
				if (weightInfo.class.isMandatory) {
					weightInfoClass = 'mandatory';
				} else if (weightInfo.class.isOperational) {
					weightInfoClass = 'operational';
				}

				/**
				 * `extrinsicBaseWeight` changed from using system.extrinsicBaseWeight => system.blockWeights.perClass[weightInfoClass].baseExtrinsic
				 * in polkadot v0.8.27 due to this pr: https://github.com/paritytech/substrate/pull/6629 .
				 * https://github.com/paritytech/substrate-api-sidecar/issues/393 .
				 * https://github.com/polkadot-js/api/issues/2365
				 */
				let extrinsicBaseWeight;
				if (runtimeDoesNotMatch) {
					if (!decorated) {
						extrinsics[idx].info = {
							error:
								'Failure retrieving necessary decorated metadata',
						};

						continue;
					}

					extrinsicBaseWeight =
						((decorated.consts.system
							?.extrinsicBaseWeight as unknown) as AbstractInt) ||
						(((decorated.consts.system
							?.blockWeights as unknown) as BlockWeights)
							.perClass[weightInfoClass] as WeightPerClass)
							.baseExtrinsic;
				} else {
					// We are querying a runtime that matches the decorated metadata in the api
					extrinsicBaseWeight =
						(api.consts.system
							?.extrinsicBaseWeight as AbstractInt) ||
						(api.consts.system.blockWeights.perClass[
							weightInfoClass
						] as WeightPerClass).baseExtrinsic;
				}

				const len = block.extrinsics[idx].encodedLength;
				const weight = weightInfo.weight;

				const partialFee = calcFee.calc_fee(
					BigInt(weight.toString()),
					len,
					extrinsicBaseWeight.toBigInt()
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
			finalized,
		};
	}

	/**
	 *
	 * @param block Takes in a block which is the result of `BlocksService.fetchBlock`
	 * @param extrinsicIndex Parameter passed into the request
	 */
	fetchExtrinsicByIndex(
		block: IBlock,
		extrinsicIndex: number
	): IExtrinsicIndex {
		if (extrinsicIndex > block.extrinsics.length - 1) {
			throw new BadRequest('Requested `extrinsicIndex` does not exist');
		}

		const { hash, number } = block;
		const height = number.unwrap().toString(10);

		return {
			at: {
				height,
				hash,
			},
			extrinsics: block.extrinsics[extrinsicIndex],
		};
	}

	/**
	 * Extract extrinsics from a block.
	 *
	 * @param block Block
	 * @param events events fetched by `fetchEvents`
	 */
	private extractExtrinsics(
		block: Block,
		events: EventRecord[] | string,
		extrinsicDocs: boolean
	) {
		const defaultSuccess = typeof events === 'string' ? events : false;

		return block.extrinsics.map((extrinsic) => {
			const {
				method,
				nonce,
				signature,
				signer,
				isSigned,
				tip,
			} = extrinsic;
			const hash = u8aToHex(blake2AsU8a(extrinsic.toU8a(), 256));
			const call = block.registry.createType('Call', method);

			return {
				method: {
					pallet: method.section,
					method: method.method,
				},
				signature: isSigned ? { signature, signer } : null,
				nonce: isSigned ? nonce : null,
				args: this.parseGenericCall(call, block.registry).args,
				tip: isSigned ? tip : null,
				hash,
				info: {},
				events: [] as ISanitizedEvent[],
				success: defaultSuccess,
				// paysFee overrides to bool if `system.ExtrinsicSuccess|ExtrinsicFailed` event is present
				// we set to false if !isSigned because unsigned never pays a fee
				paysFee: isSigned ? null : false,
				docs: extrinsicDocs
					? this.sanitizeDocs(extrinsic.meta.documentation)
					: undefined,
			};
		});
	}

	/**
	 * Sanitize events and attribute them to an extrinsic, onInitialize, or
	 * onFinalize.
	 *
	 * @param events events from `fetchEvents`
	 * @param extrinsics extrinsics from
	 * @param hash hash of the block the events are from
	 */
	private sanitizeEvents(
		events: EventRecord[] | string,
		extrinsics: IExtrinsic[],
		hash: BlockHash,
		eventDocs: boolean
	) {
		const onInitialize = { events: [] as ISanitizedEvent[] };
		const onFinalize = { events: [] as ISanitizedEvent[] };

		if (Array.isArray(events)) {
			for (const record of events) {
				const { event, phase } = record;

				const sanitizedEvent = {
					method: {
						pallet: event.section,
						method: event.method,
					},
					data: event.data,
					docs: eventDocs
						? this.sanitizeDocs(event.data.meta.documentation)
						: undefined,
				};

				if (phase.isApplyExtrinsic) {
					const extrinsicIdx = phase.asApplyExtrinsic.toNumber();
					const extrinsic = extrinsics[extrinsicIdx];

					if (!extrinsic) {
						throw new Error(
							`Missing extrinsic ${extrinsicIdx} in block ${hash.toString()}`
						);
					}

					if (event.method === Event.success) {
						extrinsic.success = true;
					}

					if (
						event.method === Event.success ||
						event.method === Event.failure
					) {
						const sanitizedData = event.data.toJSON() as AnyJson[];

						for (const data of sanitizedData) {
							if (extrinsic.signature && isPaysFee(data)) {
								extrinsic.paysFee =
									data.paysFee === true ||
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

		return {
			extrinsics,
			onInitialize,
			onFinalize,
		};
	}

	/**
	 * Create calcFee from params or return `null` if calcFee cannot be created.
	 *
	 * @param api ApiPromise
	 * @param parentHash Hash of the parent block
	 * @param block Block which the extrinsic is from
	 */
	private async createCalcFee(
		api: ApiPromise,
		parentHash: Hash,
		block: Block
	): Promise<ICalcFee> {
		const perByte = api.consts.transactionPayment?.transactionByteFee;
		const extrinsicBaseWeightExists =
			api.consts.system.extrinsicBaseWeight ||
			api.consts.system.blockWeights.perClass.normal.baseExtrinsic;

		let calcFee, specName, specVersion, decorated, runtimeDoesNotMatch;
		if (
			perByte === undefined ||
			extrinsicBaseWeightExists === undefined ||
			typeof api.query.transactionPayment?.nextFeeMultiplier?.at !==
				'function'
		) {
			// We do not have the necessary materials to build calcFee, so we just give a dummy function
			// that aligns with the expected API of calcFee.
			calcFee = null;

			const version = await api.rpc.state.getRuntimeVersion(parentHash);
			[specVersion, specName] = [
				version.specName.toString(),
				version.specVersion.toNumber(),
			];
		} else {
			const coefficients = api.consts.transactionPayment.weightToFee.map(
				(c) => {
					return {
						// Anything that could overflow Number.MAX_SAFE_INTEGER needs to be serialized
						// to BigInt or string.
						coeffInteger: c.coeffInteger.toString(10),
						coeffFrac: c.coeffFrac.toNumber(),
						degree: c.degree.toNumber(),
						negative: c.negative,
					};
				}
			);

			const parentParentHash: Hash = await this.getParentParentHash(
				api,
				parentHash,
				block
			);

			const [version, multiplier] = await Promise.all([
				api.rpc.state.getRuntimeVersion(parentParentHash),
				api.query.transactionPayment.nextFeeMultiplier.at(parentHash),
			]);

			[specName, specVersion] = [
				version.specName.toString(),
				version.specVersion.toNumber(),
			];

			runtimeDoesNotMatch =
				specName !== api.runtimeVersion.specName.toString() ||
				specVersion !== api.runtimeVersion.specVersion.toNumber();

			if (runtimeDoesNotMatch) {
				const metadata = await api.rpc.state.getMetadata(
					parentParentHash
				);

				decorated = expandMetadata(api.registry, metadata);
			}

			calcFee = CalcFee.from_params(
				coefficients,
				multiplier.toString(10),
				perByte.toString(10),
				specName,
				specVersion
			);
		}

		return {
			calcFee,
			specName,
			specVersion,
			decorated,
			runtimeDoesNotMatch,
		};
	}

	/**
	 * The block where the runtime is deployed falsely proclaims it would
	 * be already using the new runtime. This workaround therefore uses the
	 * parent of the parent in order to determine the correct runtime under which
	 * this block was produced.
	 *
	 * @param api ApiPromise to use for rpc call
	 * @param parentHash Used to identify the runtime in a block
	 * @param block Used to make sure we dont
	 */
	private async getParentParentHash(
		api: ApiPromise,
		parentHash: Hash,
		block: Block
	): Promise<Hash> {
		let parentParentHash: Hash;
		if (block.header.number.toNumber() > 1) {
			parentParentHash = (await api.rpc.chain.getHeader(parentHash))
				.parentHash;
		} else {
			parentParentHash = parentHash;
		}

		return parentParentHash;
	}

	/**
	 * Fetch events for the specified block.
	 *
	 * @param api ApiPromise to use for query
	 * @param hash `BlockHash` to make query at
	 */
	private async fetchEvents(
		api: ApiPromise,
		hash: BlockHash
	): Promise<EventRecord[] | string> {
		try {
			return await api.query.system.events.at(hash);
		} catch {
			return 'Unable to fetch Events, cannot confirm extrinsic status. Check pruning settings on the node.';
		}
	}

	/**
	 * Helper function for `parseGenericCall`.
	 *
	 * @param argsArray array of `Codec` values
	 * @param registry type registry of the block the call belongs to
	 */
	private parseArrayGenericCalls(
		argsArray: Codec[],
		registry: Registry
	): (Codec | ISanitizedCall)[] {
		return argsArray.map((argument) => {
			if (argument instanceof GenericCall) {
				return this.parseGenericCall(argument, registry);
			}

			return argument;
		});
	}

	/**
	 * Recursively parse a `GenericCall` in order to label its arguments with
	 * their param names and give a human friendly method name (opposed to just a
	 * call index). Parses `GenericCall`s that are nested as arguments.
	 *
	 * @param genericCall `GenericCall`
	 * @param registry type registry of the block the call belongs to
	 */
	private parseGenericCall(
		genericCall: GenericCall,
		registry: Registry
	): ISanitizedCall {
		const newArgs = {};

		// Pull out the struct of arguments to this call
		const callArgs = genericCall.get('args') as Struct;

		// Make sure callArgs exists and we can access its keys
		if (callArgs && callArgs.defKeys) {
			// paramName is a string
			for (const paramName of callArgs.defKeys) {
				const argument = callArgs.get(paramName);

				if (Array.isArray(argument)) {
					newArgs[paramName] = this.parseArrayGenericCalls(
						argument,
						registry
					);
				} else if (argument instanceof GenericCall) {
					newArgs[paramName] = this.parseGenericCall(
						argument,
						registry
					);
				} else if (
					paramName === 'call' &&
					argument?.toRawType() === 'Bytes'
				) {
					// multiSig.asMulti.args.call is an OpaqueCall (Vec<u8>) that we
					// serialize to a polkadot-js Call and parse so it is not a hex blob.
					try {
						const call = registry.createType(
							'Call',
							argument.toHex()
						);
						newArgs[paramName] = this.parseGenericCall(
							call,
							registry
						);
					} catch {
						newArgs[paramName] = argument;
					}
				} else {
					newArgs[paramName] = argument;
				}
			}
		}

		return {
			method: {
				pallet: genericCall.section,
				method: genericCall.method,
			},
			args: newArgs,
		};
	}

	// Almost exact mimic of https://github.com/polkadot-js/api/blob/e51e89df5605b692033df864aa5ab6108724af24/packages/api-derive/src/type/util.ts#L6
	// but we save a call to `getHeader` by hardcoding the logic here and using the digest from the blocks header.
	private extractAuthor(
		sessionValidators: AccountId[],
		digest: Digest
	): AccountId | undefined {
		const [pitem] = digest.logs.filter(({ type }) => type === 'PreRuntime');
		// extract from the substrate 2.0 PreRuntime digest
		if (pitem) {
			const [engine, data] = pitem.asPreRuntime;
			return engine.extractAuthor(data, sessionValidators);
		} else {
			const [citem] = digest.logs.filter(
				({ type }) => type === 'Consensus'
			);
			// extract author from the consensus (substrate 1.0, digest)
			if (citem) {
				const [engine, data] = citem.asConsensus;
				return engine.extractAuthor(data, sessionValidators);
			}
		}

		return undefined;
	}

	/**
	 * When querying a block this will immediately inform the request whether
	 * or not the queried block is considered finalized at the time of querying.
	 *
	 * @param api ApiPromise to use for query
	 * @param blockNumber Queried block number
	 * @param queriedHash Hash of user queried block
	 * @param finalizedHead Finalized head for our chain
	 * @param checkFinalized If the passed in blockId is a hash
	 */
	private async isFinalizedBlock(
		api: ApiPromise,
		blockNumber: Compact<BlockNumber>,
		queriedHash: BlockHash,
		finalizedHead: BlockHash,
		checkFinalized: boolean
	): Promise<boolean> {
		if (checkFinalized) {
			// The blockId url param is a hash
			const [finalizedHeadBlock, canonHash] = await Promise.all([
				// Returns the header of the most recently finalized block
				api.rpc.chain.getHeader(finalizedHead),
				// Fetch the hash of the block with equal height on the canon chain.
				// N.B. We assume when we query by number <= finalized head height,
				// we will always get a block on the finalized, canonical chain.
				api.rpc.chain.getBlockHash(blockNumber.unwrap()),
			]);

			// If queried by hash this is the original request param
			const hash = queriedHash.toHex();

			// If this conditional is satisfied, the queried hash is on a fork,
			// and is not on the canonical chain and therefore not finalized
			if (canonHash.toHex() !== hash) {
				return false;
			}

			// Retreive the finalized head blockNumber
			const finalizedHeadBlockNumber = finalizedHeadBlock?.number;

			// If the finalized head blockNumber is undefined return false
			if (!finalizedHeadBlockNumber) {
				return false;
			}

			// Check if the user's block is less than or equal to the finalized head.
			// If so, the user's block is finalized.
			return blockNumber.unwrap().lte(finalizedHeadBlockNumber.unwrap());
		} else {
			// The blockId url param is an integer

			// Returns the header of the most recently finalized block
			const finalizedHeadBlock = await api.rpc.chain.getHeader(
				finalizedHead
			);

			// Retreive the finalized head blockNumber
			const finalizedHeadBlockNumber = finalizedHeadBlock?.number;

			// If the finalized head blockNumber is undefined return false
			if (!finalizedHeadBlockNumber) {
				return false;
			}

			// Check if the user's block is less than or equal to the finalized head.
			// If so, the user's block is finalized.
			return blockNumber.unwrap().lte(finalizedHeadBlockNumber.unwrap());
		}
	}
}
