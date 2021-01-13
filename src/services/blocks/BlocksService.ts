import { ApiPromise } from '@polkadot/api';
import { SignedBlockExtended } from '@polkadot/api-derive/type';
import { GenericCall, Struct } from '@polkadot/types';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import {
	Block,
	BlockHash,
	DispatchInfo,
	EventRecord,
	Hash,
} from '@polkadot/types/interfaces';
import { AnyJson, Codec, Registry } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { CalcFee } from '@substrate/calc';

import {
	IBlock,
	IExtrinsic,
	ISanitizedCall,
	ISanitizedEvent,
	isFrameMethod,
} from '../../types/responses';
import { isPaysFee } from '../../types/util';
import { AbstractService } from '../AbstractService';
import { Trace, TraceTestOne } from './Trace';
import { TraceBlock } from './types';

/**
 * Event methods that we check for.
 */
enum Event {
	success = 'ExtrinsicSuccess',
	failure = 'ExtrinsicFailed',
}

export class BlocksService extends AbstractService {
	/**
	 * Fetch a block enhanced with augmented and derived values.
	 *
	 * @param hash `BlockHash` of the block to fetch.
	 */
	async fetchBlock(
		hash: BlockHash,
		eventDocs: boolean,
		extrinsicDocs: boolean,
		trace: boolean
	): Promise<IBlock | TraceTestOne> {
		const { api } = this;

		let block;
		let events;
		let author;
		if (trace) {
			// @ts-ignore
			const traceBlock: TraceBlock = await api.rpc.state.traceBlock(hash);
			const trace = new Trace(this.api, traceBlock);
			return trace.testOne();
		} else if (typeof api.query.session?.validators?.at === 'function') {
			// `api.derive.chain.getBlock` requires that `api.query.session?.validators?.at`
			// is a function in order to query the validator set to pull out the author
			// see: https://github.com/polkadot-js/api/blob/master/packages/api-derive/src/chain/getBlock.ts#L31
			[{ author, block }, events] = await Promise.all([
				api.derive.chain.getBlock(hash) as Promise<SignedBlockExtended>,
				this.fetchEvents(api, hash),
			]);
		} else {
			[{ block }, events] = await Promise.all([
				api.rpc.chain.getBlock(hash),
				this.fetchEvents(api, hash),
			]);
		}
		const authorId = author;

		const {
			parentHash,
			number,
			stateRoot,
			extrinsicsRoot,
			digest,
		} = block.header;

		const logs = digest.logs.map((log) => {
			const { type, index, value } = log;

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

		const { calcFee, specName, specVersion } = await this.createCalcFee(
			api,
			parentHash,
			block
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
	) {
		const perByte = api.consts.transactionPayment?.transactionByteFee;
		const extrinsicBaseWeight = api.consts.system
			?.extrinsicBaseWeight as AbstractInt;

		let calcFee, specName, specVersion;
		if (
			perByte === undefined ||
			extrinsicBaseWeight === undefined ||
			typeof api.query.transactionPayment?.nextFeeMultiplier?.at !==
				'function'
		) {
			// We do not have the necessary materials to build calcFee, so we just give a dummy function
			// that aligns with the expected API of calcFee.
			calcFee = { calc_fee: () => null };

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

			// The block where the runtime is deployed falsely proclaims it would
			// be already using the new runtime. This workaround therefore uses the
			// parent of the parent in order to determine the correct runtime under which
			// this block was produced.
			let parentParentHash: Hash;
			if (block.header.number.toNumber() > 1) {
				parentParentHash = (await api.rpc.chain.getHeader(parentHash))
					.parentHash;
			} else {
				parentParentHash = parentHash;
			}

			const [version, multiplier] = await Promise.all([
				api.rpc.state.getRuntimeVersion(parentParentHash),
				api.query.transactionPayment.nextFeeMultiplier.at(parentHash),
			]);

			[specName, specVersion] = [
				version.specName.toString(),
				version.specVersion.toNumber(),
			];

			calcFee = CalcFee.from_params(
				coefficients,
				extrinsicBaseWeight.toBigInt(),
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
		};
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
}
