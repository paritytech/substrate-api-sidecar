import { ApiPromise } from '@polkadot/api';
import { CalcFee } from '@polkadot/calc-fee';
import { Struct } from '@polkadot/types';
import { GenericCall } from '@polkadot/types';
import {
	BlockHash,
	DispatchInfo,
	EventRecord,
} from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';

import { IBlock, ISanitizedCall, ISanitizedEvent } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class BlocksService extends AbstractService {
	/**
	 * Fetch a block enhanced with augmented and derived values.
	 *
	 * @param hash `BlockHash` of the block to fetch.
	 */
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
			} = extrinsic;
			const hash = u8aToHex(blake2AsU8a(extrinsic.toU8a(), 256));

			return {
				method: `${method.sectionName}.${method.methodName}`,
				signature: isSigned ? { signature, signer } : null,
				nonce,
				args: BlocksService.parseGenericCall(method).args,
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
	 */
	private static parseArrayGenericCalls(
		argsArray: Codec[]
	): (Codec | ISanitizedCall)[] {
		return argsArray.map((argument) => {
			if (argument instanceof GenericCall) {
				return this.parseGenericCall(argument);
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
	 */
	private static parseGenericCall(genericCall: GenericCall): ISanitizedCall {
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
}
