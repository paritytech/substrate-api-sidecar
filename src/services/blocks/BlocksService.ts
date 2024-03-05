// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

import type { ApiPromise } from '@polkadot/api';
import type { ApiDecoration } from '@polkadot/api/types';
import { extractAuthor } from '@polkadot/api-derive/type/util';
import { Compact, GenericCall, Option, Struct, Text, u32, Vec } from '@polkadot/types';
import type { GenericExtrinsic } from '@polkadot/types/extrinsic';
import type {
	AccountId32,
	Block,
	BlockHash,
	BlockNumber,
	DispatchInfo,
	EventRecord,
	Header,
	InclusionFee,
	RuntimeDispatchInfo,
	RuntimeDispatchInfoV1,
	Weight,
	WeightV1,
} from '@polkadot/types/interfaces';
import type { AnyJson, Codec, Registry } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { calc_partial_fee } from '@substrate/calc';
import BN from 'bn.js';
import { BadRequest, InternalServerError } from 'http-errors';
import type { LRUCache } from 'lru-cache';

import { QueryFeeDetailsCache } from '../../chains-config/cache';
import {
	IBlock,
	IBlockRaw,
	IExtrinsic,
	IExtrinsicIndex,
	ISanitizedCall,
	ISanitizedEvent,
	isFrameMethod,
} from '../../types/responses';
import type { IOption } from '../../types/util';
import { isPaysFee } from '../../types/util';
import { PromiseQueue } from '../../util/PromiseQueue';
import { AbstractService } from '../AbstractService';
import { XcmDecoder } from './XCMDecoder';

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
	noFees: boolean;
	checkDecodedXcm: boolean;
	paraId?: number;
}

interface ExtrinsicSuccessOrFailedOverride {
	weight: Weight;
	class: DispatchInfo;
}

/**
 * Event methods that we check for.
 */
enum Event {
	success = 'ExtrinsicSuccess',
	failure = 'ExtrinsicFailed',
	transactionPaidFee = 'TransactionFeePaid',
}

export class BlocksService extends AbstractService {
	constructor(
		api: ApiPromise,
		private minCalcFeeRuntime: IOption<number>,
		private blockStore: LRUCache<string, IBlock>,
		private hasQueryFeeApi: QueryFeeDetailsCache,
	) {
		super(api);
	}

	/**
	 * Fetch a block augmented with derived values.
	 *
	 * @param hash `BlockHash` of the block to fetch.
	 * @param FetchBlockOptions options for additonal information.
	 */
	async fetchBlock(
		hash: BlockHash,
		historicApi: ApiDecoration<'promise'>,
		{
			eventDocs,
			extrinsicDocs,
			checkFinalized,
			queryFinalizedHead,
			omitFinalizedTag,
			noFees,
			checkDecodedXcm,
			paraId,
		}: FetchBlockOptions,
	): Promise<IBlock> {
		const { api } = this;

		// Create a key for the cache that is a concatenation of the block hash and all the query params included in the request
		const cacheKey =
			hash.toString() +
			Number(eventDocs) +
			Number(extrinsicDocs) +
			Number(checkFinalized) +
			Number(noFees) +
			Number(checkDecodedXcm) +
			Number(paraId);

		// Before making any api calls check the cache if the queried block exists
		const isBlockCached = this.blockStore.get(cacheKey);

		if (isBlockCached && isBlockCached.finalized !== false) {
			return isBlockCached;
		}

		const [{ block }, { specName, specVersion }, validators, events, finalizedHead] = await Promise.all([
			api.rpc.chain.getBlock(hash),
			api.rpc.state.getRuntimeVersion(hash),
			this.fetchValidators(historicApi),
			this.fetchEvents(historicApi),
			queryFinalizedHead ? api.rpc.chain.getFinalizedHead() : Promise.resolve(hash),
		]);

		if (block === undefined) {
			throw new InternalServerError('Error querying for block');
		}

		const { parentHash, number, stateRoot, extrinsicsRoot, digest } = block.header;

		const authorId = extractAuthor(digest, validators);

		const logs = digest.logs.map(({ type, index, value }) => {
			return { type, index, value };
		});

		const nonSanitizedExtrinsics = this.extractExtrinsics(block, events, historicApi.registry, extrinsicDocs);

		const { extrinsics, onInitialize, onFinalize } = this.sanitizeEvents(
			events,
			nonSanitizedExtrinsics,
			hash,
			eventDocs,
		);

		let finalized = undefined;

		if (!omitFinalizedTag) {
			// Check if the requested block is finalized
			finalized = await this.isFinalizedBlock(api, number, hash, finalizedHead, checkFinalized);
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

		const previousBlockHash = await this.fetchPreviousBlockHash(number);
		/**
		 * Fee calculation logic. This runs the extrinsics concurrently.
		 */
		const pQueue = new PromiseQueue(4);
		const feeTasks = [];
		for (let idx = 0; idx < block.extrinsics.length; ++idx) {
			feeTasks.push(
				pQueue.run(async () => {
					await this.resolveExtFees(extrinsics, block, idx, noFees, previousBlockHash, specVersion, specName);
				}),
			);
		}
		const decodedMsgs = checkDecodedXcm ? new XcmDecoder(api, specName.toString(), extrinsics, paraId) : undefined;
		const decodedXcmMsgs = decodedMsgs?.messages;

		await Promise.all(feeTasks);

		const response = {
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
			decodedXcmMsgs,
		};

		// Store the block in the cache
		this.blockStore.set(cacheKey, response);

		return response;
	}

	private async resolveExtFees(
		extrinsics: IExtrinsic[],
		block: Block,
		idx: number,
		noFees: boolean,
		previousBlockHash: BlockHash,
		specVersion: u32,
		specName: Text,
	) {
		const { api } = this;

		if (noFees) {
			extrinsics[idx].info = {};
			return;
		}

		if (!extrinsics[idx].paysFee || !block.extrinsics[idx].isSigned) {
			return;
		}

		if (this.minCalcFeeRuntime === null) {
			extrinsics[idx].info = {
				error: `Fee calculation not supported for this network`,
			};
			return;
		}

		if (this.minCalcFeeRuntime > specVersion.toNumber()) {
			extrinsics[idx].info = {
				error: `Fee calculation not supported for ${specVersion.toString()}#${specName.toString()}`,
			};
			return;
		}

		const xtEvents = extrinsics[idx].events;
		const completedEvent = xtEvents.find(
			({ method }) => isFrameMethod(method) && (method.method === Event.success || method.method === Event.failure),
		);

		if (!completedEvent) {
			extrinsics[idx].info = {
				error: 'Unable to find success or failure event for extrinsic',
			};

			return;
		}

		const completedData = completedEvent.data;
		if (!completedData) {
			extrinsics[idx].info = {
				error: 'Success or failure event for extrinsic does not contain expected data',
			};

			return;
		}

		// Both ExtrinsicSuccess and ExtrinsicFailed events have DispatchInfo
		// types as their final arg
		const weightInfo = completedData[completedData.length - 1] as DispatchInfo;
		if (!weightInfo.weight) {
			extrinsics[idx].info = {
				error: 'Success or failure event for extrinsic does not specify weight',
			};

			return;
		}

		if (!api.rpc.payment?.queryInfo && !api.call.transactionPaymentApi?.queryInfo) {
			extrinsics[idx].info = {
				error: 'Rpc method payment::queryInfo is not available',
			};

			return;
		}

		const transactionPaidFeeEvent = xtEvents.find(
			({ method }) => isFrameMethod(method) && method.method === Event.transactionPaidFee,
		);
		const extrinsicSuccess = xtEvents.find(({ method }) => isFrameMethod(method) && method.method === Event.success);
		const extrinsicFailed = xtEvents.find(({ method }) => isFrameMethod(method) && method.method === Event.failure);

		const eventFailureOrSuccess = extrinsicSuccess || extrinsicFailed;
		if (transactionPaidFeeEvent && eventFailureOrSuccess) {
			let availableData: ExtrinsicSuccessOrFailedOverride;
			if (extrinsicSuccess) {
				availableData = eventFailureOrSuccess.data[0] as unknown as ExtrinsicSuccessOrFailedOverride;
			} else {
				availableData = eventFailureOrSuccess.data[1] as unknown as ExtrinsicSuccessOrFailedOverride;
			}

			extrinsics[idx].info = {
				weight: availableData.weight,
				class: availableData.class,
				partialFee: transactionPaidFeeEvent.data[1].toString(),
				kind: 'fromEvent',
			};
			return;
		}

		/**
		 * Grab the initial partialFee, and information required for calculating a partialFee
		 * if queryFeeDetails is available in the runtime.
		 */
		const {
			class: dispatchClass,
			partialFee,
			weight,
		} = await this.fetchQueryInfo(block.extrinsics[idx], previousBlockHash);
		const versionedWeight = (weight as Weight).refTime ? (weight as Weight).refTime.unwrap() : (weight as WeightV1);

		let finalPartialFee = partialFee.toString(),
			dispatchFeeType = 'preDispatch';
		if (transactionPaidFeeEvent) {
			finalPartialFee = transactionPaidFeeEvent.data[1].toString();
			dispatchFeeType = 'fromEvent';
		} else {
			/**
			 * Call queryFeeDetails. It may not be available in the runtime and will
			 * error automatically when we try to call it. We cache the runtimes it will error so we
			 * don't try to call it again given a specVersion.
			 */
			const doesQueryFeeDetailsExist = this.hasQueryFeeApi.hasQueryFeeDetails(specVersion.toNumber());
			if (doesQueryFeeDetailsExist === 'available') {
				finalPartialFee = await this.fetchQueryFeeDetails(
					block.extrinsics[idx],
					previousBlockHash,
					weightInfo.weight,
					versionedWeight.toString(),
				);

				dispatchFeeType = 'postDispatch';
			} else if (doesQueryFeeDetailsExist === 'unknown') {
				try {
					finalPartialFee = await this.fetchQueryFeeDetails(
						block.extrinsics[idx],
						previousBlockHash,
						weightInfo.weight,
						versionedWeight.toString(),
					);
					dispatchFeeType = 'postDispatch';
					this.hasQueryFeeApi.setRegisterWithCall(specVersion.toNumber());
				} catch {
					this.hasQueryFeeApi.setRegisterWithoutCall(specVersion.toNumber());
					console.warn('The error above is automatically emitted from polkadot-js, and can be ignored.');
				}
			}
		}

		extrinsics[idx].info = {
			weight: weightInfo.weight,
			class: dispatchClass,
			partialFee: api.registry.createType('Balance', finalPartialFee),
			kind: dispatchFeeType,
		};
	}

	/**
	 * Fetch `payment_queryFeeDetails`.
	 *
	 * @param ext
	 * @param previousBlockHash
	 * @param extrinsicSuccessWeight
	 * @param estWeight
	 */
	private async fetchQueryFeeDetails(
		ext: GenericExtrinsic,
		previousBlockHash: BlockHash,
		extrinsicSuccessWeight: Weight,
		estWeight: string,
	): Promise<string> {
		const { api } = this;
		const apiAt = await api.at(previousBlockHash);

		let inclusionFee;
		if (apiAt.call.transactionPaymentApi.queryFeeDetails) {
			const u8a = ext.toU8a();
			const result = await apiAt.call.transactionPaymentApi.queryFeeDetails(u8a, u8a.length);
			inclusionFee = result.inclusionFee;
		} else {
			const result = await api.rpc.payment.queryFeeDetails(ext.toHex(), previousBlockHash);
			inclusionFee = result.inclusionFee;
		}

		const finalPartialFee = this.calcPartialFee(extrinsicSuccessWeight, estWeight, inclusionFee);

		return finalPartialFee;
	}

	/**
	 * Fetch `payment_queryInfo`.
	 *
	 * @param ext
	 * @param previousBlockHash
	 */
	private async fetchQueryInfo(
		ext: GenericExtrinsic,
		previousBlockHash: BlockHash,
	): Promise<RuntimeDispatchInfo | RuntimeDispatchInfoV1> {
		const { api } = this;
		const apiAt = await api.at(previousBlockHash);
		if (apiAt.call.transactionPaymentApi.queryInfo) {
			const u8a = ext.toU8a();
			return apiAt.call.transactionPaymentApi.queryInfo(u8a, u8a.length);
		} else {
			// fallback to rpc call
			return api.rpc.payment.queryInfo(ext.toHex(), previousBlockHash);
		}
	}

	/**
	 * Retrieve the blockHash for the previous block to the one getting queried.
	 * If the block is the geneisis hash it will return the same blockHash.
	 *
	 * @param blockNumber The blockId being queried
	 */
	private async fetchPreviousBlockHash(blockNumber: Compact<BlockNumber>): Promise<BlockHash> {
		const { api } = this;

		const num = blockNumber.toBn();
		return num.isZero() ? await api.rpc.chain.getBlockHash(num) : await api.rpc.chain.getBlockHash(num.sub(new BN(1)));
	}

	/**
	 * Calculate the partialFee for an extrinsic. This uses `calc_partial_fee` from `@substrate/calc`.
	 * Please reference the rust code in `@substrate/calc` too see docs on the algorithm.
	 *
	 * @param extrinsicSuccessWeight
	 * @param estWeight
	 * @param inclusionFee
	 */
	private calcPartialFee(
		extrinsicSuccessWeight: Weight,
		estWeight: string,
		inclusionFee: Option<InclusionFee>,
	): string {
		if (inclusionFee.isSome) {
			const { baseFee, lenFee, adjustedWeightFee } = inclusionFee.unwrap();

			return calc_partial_fee(
				baseFee.toString(),
				lenFee.toString(),
				adjustedWeightFee.toString(),
				estWeight.toString(),
				extrinsicSuccessWeight.toString(),
			);
		} else {
			// When the inclusion fee isNone we are dealing with a unsigned extrinsic.
			return '0';
		}
	}

	/**
	 * Return the header of a block
	 *
	 * @param hash When no hash is inputted the header of the chain will be queried.
	 */
	async fetchBlockHeader(hash?: BlockHash): Promise<Header> {
		const { api } = this;

		const header = hash ? await api.rpc.chain.getHeader(hash) : await api.rpc.chain.getHeader();

		return header;
	}

	/**
	 *
	 * @param block Takes in a block which is the result of `BlocksService.fetchBlock`
	 * @param extrinsicIndex Parameter passed into the request
	 */
	fetchExtrinsicByIndex(block: IBlock, extrinsicIndex: number): IExtrinsicIndex {
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
	 * @param regsitry The corresponding blocks runtime registry
	 * @param extrinsicDocs To include the extrinsic docs or not
	 */
	private extractExtrinsics(
		block: Block,
		events: Vec<EventRecord> | string,
		registry: Registry,
		extrinsicDocs: boolean,
	): IExtrinsic[] {
		const defaultSuccess = typeof events === 'string' ? events : false;

		return block.extrinsics.map((extrinsic) => {
			const { method, nonce, signature, signer, isSigned, tip, era } = extrinsic;
			const hash = u8aToHex(blake2AsU8a(extrinsic.toU8a(), 256));
			const call = registry.createType('Call', method);

			return {
				method: {
					pallet: method.section,
					method: method.method,
				},
				signature: isSigned ? { signature, signer } : null,
				nonce: isSigned ? nonce : null,
				args: this.parseGenericCall(call, registry).args,
				tip: isSigned ? tip : null,
				hash,
				info: {},
				era,
				events: [] as ISanitizedEvent[],
				success: defaultSuccess,
				// paysFee overrides to bool if `system.ExtrinsicSuccess|ExtrinsicFailed` event is present
				// we set to false if !isSigned because unsigned never pays a fee
				paysFee: isSigned ? null : false,
				docs: extrinsicDocs ? this.sanitizeDocs(extrinsic.meta.docs) : undefined,
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
		eventDocs: boolean,
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
					docs: eventDocs ? this.sanitizeDocs(event.data.meta.docs) : undefined,
				};

				if (phase.isApplyExtrinsic) {
					const extrinsicIdx = phase.asApplyExtrinsic.toNumber();
					const extrinsic = extrinsics[extrinsicIdx];

					if (!extrinsic) {
						throw new Error(`Missing extrinsic ${extrinsicIdx} in block ${hash.toString()}`);
					}

					if (event.method === Event.success) {
						extrinsic.success = true;
					}

					if (event.method === Event.success || event.method === Event.failure) {
						const sanitizedData = event.data.toJSON() as AnyJson[];

						for (const data of sanitizedData) {
							if (extrinsic.signature && isPaysFee(data)) {
								extrinsic.paysFee = data.paysFee === true || data.paysFee === 'Yes';

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
	 * Fetch events for the specified block.
	 *
	 * @param historicApi ApiDecoration to use for the query
	 */
	private async fetchEvents(historicApi: ApiDecoration<'promise'>): Promise<Vec<EventRecord> | string> {
		try {
			return await historicApi.query.system.events();
		} catch {
			return 'Unable to fetch Events, cannot confirm extrinsic status. Check pruning settings on the node.';
		}
	}

	/**
	 * Checks to see if the current chain has the session module, then retrieve all
	 * validators.
	 *
	 * @param historicApi ApiDecoration to use for the query
	 */
	private async fetchValidators(historicApi: ApiDecoration<'promise'>): Promise<Vec<AccountId32>> {
		return historicApi.query.session
			? await historicApi.query.session.validators()
			: ([] as unknown as Vec<AccountId32>);
	}

	/**
	 * Helper function for `parseGenericCall`.
	 *
	 * @param argsArray array of `Codec` values
	 * @param registry type registry of the block the call belongs to
	 */
	private parseArrayGenericCalls(argsArray: Codec[], registry: Registry): (Codec | ISanitizedCall)[] {
		return argsArray.map((argument) => {
			if (argument instanceof GenericCall) {
				return this.parseGenericCall(argument as GenericCall, registry);
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
	private parseGenericCall(genericCall: GenericCall, registry: Registry): ISanitizedCall {
		const newArgs = {};

		// Pull out the struct of arguments to this call
		const callArgs = genericCall.get('args') as Struct;

		// Make sure callArgs exists and we can access its keys
		if (callArgs && callArgs.defKeys) {
			// paramName is a string
			for (const paramName of callArgs.defKeys) {
				const argument = callArgs.get(paramName);

				if (Array.isArray(argument)) {
					newArgs[paramName] = this.parseArrayGenericCalls(argument, registry);
				} else if (argument instanceof GenericCall) {
					newArgs[paramName] = this.parseGenericCall(argument as GenericCall, registry);
				} else if (
					argument &&
					paramName === 'call' &&
					['Bytes', 'WrapperKeepOpaque<Call>', 'WrapperOpaque<Call>'].includes(argument?.toRawType())
				) {
					// multiSig.asMulti.args.call is either an OpaqueCall (Vec<u8>),
					// WrapperKeepOpaque<Call>, or WrapperOpaque<Call> that we
					// serialize to a polkadot-js Call and parse so it is not a hex blob.
					try {
						const call = registry.createType('Call', argument.toHex());
						newArgs[paramName] = this.parseGenericCall(call, registry);
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
		checkFinalized: boolean,
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
			const finalizedHeadBlock = await api.rpc.chain.getHeader(finalizedHead);

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

	/**
	 * Fetch a block with raw extrinics values.
	 *
	 * @param hash `BlockHash` of the block to fetch.
	 */
	async fetchBlockRaw(hash: BlockHash): Promise<IBlockRaw> {
		const { api } = this;
		const { block } = await api.rpc.chain.getBlock(hash);

		const { parentHash, number, stateRoot, extrinsicsRoot, digest } = block.header;
		const { extrinsics } = block;

		const logs = digest.logs.map(({ type, index, value }) => {
			return { type, index, value };
		});

		return {
			parentHash: parentHash,
			number: number.toHex(),
			stateRoot: stateRoot,
			extrinsicRoot: extrinsicsRoot,
			digest: { logs },
			extrinsics: extrinsics,
		};
	}
}
