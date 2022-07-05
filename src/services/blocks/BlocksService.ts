// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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
import { extractAuthor } from '@polkadot/api-derive/type/util';
import { Compact, GenericCall, Struct, Vec } from '@polkadot/types';
import {
	AccountId32,
	Balance,
	Block,
	BlockHash,
	BlockNumber,
	DispatchInfo,
	EventRecord,
	Header,
} from '@polkadot/types/interfaces';
import { AnyJson, Codec, Registry } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { BadRequest, InternalServerError } from 'http-errors';
import LRU from 'lru-cache';

import {
	IBlock,
	IExtrinsic,
	IExtrinsicIndex,
	ISanitizedCall,
	ISanitizedEvent,
	isFrameMethod,
} from '../../types/responses';
import { IOption } from '../../types/util';
import { isPaysFee } from '../../types/util';
import { subIntegers } from '../../util/integers/compare';
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
	getFeeByEvent: boolean;
}

/**
 * Event methods that we check for.
 */
enum Event {
	success = 'ExtrinsicSuccess',
	failure = 'ExtrinsicFailed',
	withdraw = 'Withdraw',
	deposit = 'Deposit',
}

export class BlocksService extends AbstractService {
	constructor(
		api: ApiPromise,
		private minCalcFeeRuntime: IOption<number>,
		private blockStore: LRU<string, IBlock>
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
			getFeeByEvent,
		}: FetchBlockOptions
	): Promise<IBlock> {
		const { api } = this;

		// Before making any api calls check the cache if the queried block exists
		const isBlockCached = this.blockStore.get(hash.toString());

		if (isBlockCached) {
			return isBlockCached;
		}

		const [
			{ block },
			{ specName, specVersion },
			validators,
			events,
			finalizedHead,
		] = await Promise.all([
			api.rpc.chain.getBlock(hash),
			api.rpc.state.getRuntimeVersion(hash),
			this.fetchValidators(historicApi),
			this.fetchEvents(historicApi),
			queryFinalizedHead
				? api.rpc.chain.getFinalizedHead()
				: Promise.resolve(hash),
		]);

		if (block === undefined) {
			throw new InternalServerError('Error querying for block');
		}

		const { parentHash, number, stateRoot, extrinsicsRoot, digest } =
			block.header;

		const authorId = extractAuthor(digest, validators);

		const logs = digest.logs.map(({ type, index, value }) => {
			return { type, index, value };
		});

		const nonSanitizedExtrinsics = this.extractExtrinsics(
			block,
			events,
			historicApi.registry,
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

		for (let idx = 0; idx < block.extrinsics.length; ++idx) {
			if (!extrinsics[idx].paysFee || !block.extrinsics[idx].isSigned) {
				continue;
			}

			if (this.minCalcFeeRuntime === null) {
				extrinsics[idx].info = {
					error: `Fee calculation not supported for this network`,
				};
				continue;
			}

			if (this.minCalcFeeRuntime > specVersion.toNumber()) {
				extrinsics[idx].info = {
					error: `Fee calculation not supported for ${specVersion.toString()}#${specName.toString()}`,
				};
				continue;
			}

			const xtEvents = extrinsics[idx].events;
			const completedEvent = xtEvents.find(
				({ method }) =>
					isFrameMethod(method) &&
					(method.method === Event.success || method.method === Event.failure)
			);

			if (!completedEvent) {
				extrinsics[idx].info = {
					error: 'Unable to find success or failure event for extrinsic',
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

			if (!api.rpc.payment || !api.rpc.payment.queryInfo) {
				extrinsics[idx].info = {
					error: 'Rpc method payment::queryInfo is not available',
				};

				continue;
			}

			const { dispatchClass, partialFee, error } = await this.getPartialFeeInfo(
				extrinsics[idx].events,
				block.extrinsics[idx].toHex(),
				hash,
				getFeeByEvent
			);

			if (error) {
				extrinsics[idx].info = {
					error,
				};

				continue;
			}

			extrinsics[idx].info = api.createType('RuntimeDispatchInfo', {
				weight: weightInfo.weight,
				class: dispatchClass,
				partialFee: partialFee,
			});
		}

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
		};

		// Store the block in the cache
		this.blockStore.set(hash.toString(), response);

		return response;
	}

	/**
	 * Return the header of a block
	 *
	 * @param hash When no hash is inputted the header of the chain will be queried.
	 */
	async fetchBlockHeader(hash?: BlockHash): Promise<Header> {
		const { api } = this;

		const header = hash
			? await api.rpc.chain.getHeader(hash)
			: await api.rpc.chain.getHeader();

		return header;
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
	 * @param regsitry The corresponding blocks runtime registry
	 * @param extrinsicDocs To include the extrinsic docs or not
	 */
	private extractExtrinsics(
		block: Block,
		events: Vec<EventRecord> | string,
		registry: Registry,
		extrinsicDocs: boolean
	): IExtrinsic[] {
		const defaultSuccess = typeof events === 'string' ? events : false;

		return block.extrinsics.map((extrinsic) => {
			const { method, nonce, signature, signer, isSigned, tip, era } =
				extrinsic;
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
				docs: extrinsicDocs
					? this.sanitizeDocs(extrinsic.meta.docs)
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
					docs: eventDocs ? this.sanitizeDocs(event.data.meta.docs) : undefined,
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
									data.paysFee === true || data.paysFee === 'Yes';

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
	private async fetchEvents(
		historicApi: ApiDecoration<'promise'>
	): Promise<Vec<EventRecord> | string> {
		try {
			return await historicApi.query.system.events();
		} catch {
			return 'Unable to fetch Events, cannot confirm extrinsic status. Check pruning settings on the node.';
		}
	}

	/**
	 * This will check whether we should query the fee by `payment::queryInfo`
	 * or by an extrinsics events.
	 *
	 * @param events The events to search through for a partialFee
	 * @param extrinsicHex Hex of the given extrinsic
	 * @param hash Blockhash we are querying
	 * @param getFeeByEvent `FeeByEvent` query parameter
	 */
	private async getPartialFeeInfo(
		events: ISanitizedEvent[],
		extrinsicHex: string,
		hash: BlockHash,
		getFeeByEvent: boolean
	) {
		const { api } = this;
		const { class: dispatchClass, partialFee } =
			await api.rpc.payment.queryInfo(extrinsicHex, hash);

		/**
		 * Check if we should retrieve the partial_fee from the Events
		 */
		let fee: Balance | string = partialFee;
		let error: string | undefined;
		if (getFeeByEvent) {
			const feeInfo = this.getPartialFeeByEvents(events, partialFee);
			fee = feeInfo.partialFee;
			error = feeInfo.error;
		}

		return {
			partialFee: fee,
			dispatchClass,
			error,
		};
	}

	/**
	 * This searches through an extrinsics given events to see if there is a partialFee
	 * within the data. If the estimated partialFee is within a given difference of the
	 * found fee within the data than we return that result.
	 *
	 * The order of the events we search through are:
	 * 1.Balances::Event::Withdraw
	 * 2.Treasury::Event::Deposit
	 * 3.Balances::Event::Deposit
	 *
	 * @param events The events to search through for a partialFee
	 * @param partialFee Estimated partialFee given by `payment::queryInfo`
	 */
	private getPartialFeeByEvents(
		events: ISanitizedEvent[],
		partialFee: Balance
	): { partialFee: string; error?: string } {
		// Check Event:Withdraw event for the balances pallet
		const withdrawEvent = this.findEvent(events, 'balances', Event.withdraw);
		if (withdrawEvent.length > 0 && withdrawEvent[0].data) {
			const dataArr = withdrawEvent[0].data.toJSON();
			if (Array.isArray(dataArr)) {
				const fee = (dataArr as Array<number>)[dataArr.length - 1];

				// The difference between values is 00.00001% or less so they are alike.
				if (this.areFeesSimilar(new BN(fee), partialFee)) {
					return {
						partialFee: fee.toString(),
					};
				}
			}
		}

		// Check the Event::Deposit for the treasury pallet
		const treasuryEvent = this.findEvent(events, 'treasury', Event.deposit);
		if (treasuryEvent.length > 0 && treasuryEvent[0].data) {
			const dataArr = treasuryEvent[0].data.toJSON();
			if (Array.isArray(dataArr)) {
				const fee = (dataArr as Array<number>)[0];

				// The difference between values is 00.00001% or less so they are alike.
				if (this.areFeesSimilar(new BN(fee), partialFee)) {
					return {
						partialFee: fee.toString(),
					};
				}
			}
		}

		// Check Event::Deposit events for the balances pallet.
		const depositEvents = this.findEvent(events, 'balances', Event.deposit);
		if (depositEvents.length > 0) {
			let sumOfFees = new BN(0);
			depositEvents.forEach(
				({ data }) =>
					(sumOfFees = sumOfFees.add(new BN(data[data.length - 1].toString())))
			);

			// The difference between values is 00.00001% or less so they are alike.
			if (this.areFeesSimilar(sumOfFees, partialFee)) {
				return {
					partialFee: sumOfFees.toString(),
				};
			}
		}

		return {
			partialFee: partialFee.toString(),
			error: 'Could not find a reliable fee within the events data.',
		};
	}

	/**
	 * Find the corresponding events relevant to the passed in pallet, and method name.
	 *
	 * @param events The events to search through for a partialFee
	 * @param palletName Pallet to search for
	 * @param methodName Method to search for
	 */
	private findEvent(
		events: ISanitizedEvent[],
		palletName: string,
		methodName: string
	): ISanitizedEvent[] {
		return events.filter(
			({ method, data }) =>
				isFrameMethod(method) &&
				method.method === methodName &&
				method.pallet === palletName &&
				data
		);
	}

	/**
	 * Checks to see if the value in an event is within 00.00001% accuracy of
	 * the queried `partialFee` from `rpc::payment::queryInfo`.
	 *
	 * @param eventBalance Balance returned in the data of an event
	 * @param partialFee Fee queried from `rpc::payment::queryInfo`
	 * @param diff difference between the
	 */
	private areFeesSimilar(eventBalance: BN, partialFee: BN): boolean {
		const diff = subIntegers(eventBalance, partialFee);

		return (
			eventBalance.toString().length - diff.toString().length > 5 &&
			eventBalance.toString().length === partialFee.toString().length
		);
	}

	/**
	 * Checks to see if the current chain has the session module, then retrieve all
	 * validators.
	 *
	 * @param historicApi ApiDecoration to use for the query
	 */
	private async fetchValidators(
		historicApi: ApiDecoration<'promise'>
	): Promise<Vec<AccountId32>> {
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
	private parseArrayGenericCalls(
		argsArray: Codec[],
		registry: Registry
	): (Codec | ISanitizedCall)[] {
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
					newArgs[paramName] = this.parseArrayGenericCalls(argument, registry);
				} else if (argument instanceof GenericCall) {
					newArgs[paramName] = this.parseGenericCall(
						argument as GenericCall,
						registry
					);
				} else if (
					argument &&
					paramName === 'call' &&
					['Bytes', 'WrapperKeepOpaque<Call>', 'WrapperOpaque<Call>'].includes(
						argument?.toRawType()
					)
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
}
