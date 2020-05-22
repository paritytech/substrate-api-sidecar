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
import { BlockHash } from '@polkadot/types/interfaces/chain';
import { EventRecord } from '@polkadot/types/interfaces/system';
import { EventData } from '@polkadot/types/generic/Event';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { getSpecTypes } from '@polkadot/types-known';
import { u32 } from '@polkadot/types/primitive';
import { DispatchInfo } from '@polkadot/types/interfaces';

import * as BN from 'bn.js';

interface SanitizedEvent {
	method: string;
	data: EventData;
}

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

	async fetchBlock(hash: BlockHash) {
		const api = await this.ensureMeta(hash);
		const [{ block }, events] = await Promise.all([
			api.rpc.chain.getBlock(hash),
			this.fetchEvents(api, hash),
		]);

		const { parentHash, number, stateRoot, extrinsicsRoot } = block.header;

		const logs = block.header.digest.logs.map((log) => {
			const { type, index, value } = log;

			return { type, index, value };
		});

		const defaultSuccess = typeof events === 'string' ? events : false;
		const extrinsics = block.extrinsics.map((extrinsic) => {
			const { method, nonce, signature, signer, isSigned, tip, args } = extrinsic;
			const hash = u8aToHex(blake2AsU8a(extrinsic.toU8a(), 256));

			return {
				method: `${method.sectionName}.${method.methodName}`,
				signature: isSigned ? { signature, signer } : null,
				nonce,
				args,
				tip,
				hash,
				info: {},
				events: [] as SanitizedEvent[],
				success: defaultSuccess,
				// paysFee overrides to bool if `system.ExtrinsicSuccess|ExtrinsicFailed` event is present
				paysFee: null as null | boolean,
			};
		});

		const onInitialize = { events: [] as SanitizedEvent[] };
		const onFinalize = { events: [] as SanitizedEvent[] };

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
						throw new Error(`Missing extrinsic ${extrinsicIdx} in block ${hash}`);
					}

					const method = `${event.section}.${event.method}`;

					if (method === successEvent) {
						extrinsic.success = true;
					}

					if (method === successEvent || method === failureEvent) {
						const sanitizedData = event.data.toJSON() as any[];

						for (const data of sanitizedData) {
							if (data && data.paysFee) {
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

		const perBill = new BN(1e9);
		const perByteFee = api.consts.transactionPayment.transactionByteFee.mul(perBill);
		const extrinsicBaseWeight = api.consts.system.extrinsicBaseWeight.mul(perBill);
		// Here we assume that `weightToFee` Vec only has 1 element, which is of
		// degree 1. FIXME Implement polynomial.
		const coefficients = api.consts.transactionPayment.weightToFee[0];
		const coeffFrac = coefficients.coeffFrac;
		const coeffInt = coefficients.coeffInteger.mul(perBill);

		// bn.js values must be < 0x20000000000000, cannot divide by 1e18 [Ref: bn.js:128]
		const targetedFeeAdjustment = (await api.query.transactionPayment.nextFeeMultiplier.at(parentHash)).div(perBill); // FIXME This might round the number

		// TODO: We assume that the polynomial has one positive term of degree one.
		// const degree = coefficients.degree;
		// const negative = coefficients.negative;

		for (let idx = 0; idx < block.extrinsics.length; ++idx) {
			if (!extrinsics[idx].paysFee || !block.extrinsics[idx].isSigned) {
				continue;
			}

			try {
				if (api.runtimeVersion.specName.toString() === 'kusama') {
					extrinsics[idx].info = await api.rpc.payment.queryInfo(block.extrinsics[idx].toHex(), parentHash);

					continue;
				}

				const xtEvents = extrinsics[idx].events;
				const completedEvent = xtEvents.find((event) => event.method === successEvent || event.method === failureEvent);
				if (!completedEvent) {
					extrinsics[idx].info = {
						error: 'Unable to find success or failure event for extrinsic'
					};

					continue;
				}

				const completedData = completedEvent.data;
				if (!completedData) {
					extrinsics[idx].info = {
						error: 'Success or failure event for extrinsic does not contain expected data'
					};

					continue;
				}

				// both ExtrinsicSuccess and ExtrinsicFailed events have DispatchInfo types as their
				// final arg
				const weightInfo = completedData[completedData.length - 1] as DispatchInfo;
				if (!weightInfo.weight) {
					extrinsics[idx].info = {
						error: 'Success or failure event for extrinsic does not specify weight'
					};

					continue;
				}

				// Note: we use the same variable names as in Rust
				const len = block.extrinsics[idx].encodedLength;
				const lenFee = perByteFee.muln(len);

				// weight_to_fee calculation
				// FIXME Implement polynomial.
				const weight = weightInfo.weight;
				const weightedCoeffFrac = weight.mul(coeffFrac);
				const weightedCoeffInt = weight.mul(coeffInt);
				const unadjustedWeightFee = weightedCoeffInt.add(weightedCoeffFrac); // In Perbill

				const adjustableFee = lenFee.add(unadjustedWeightFee);
				const adjustedFee = targetedFeeAdjustment.mul(adjustableFee);

				// weight_to_fee calculation
				// FIXME Implement polynomial.
				const baseFeeFrac = extrinsicBaseWeight.mul(coeffFrac);
				const baseFeeInt = extrinsicBaseWeight.mul(coeffInt);
				const baseFee = baseFeeInt.add(baseFeeFrac); // In Perbill

				let partialFee = baseFee.add(adjustedFee); // In Perbill

				extrinsics[idx].info = api.createType('RuntimeDispatchInfo', {
					weight,
					class: weightInfo.class,
					partialFee: partialFee.div(perBill) // We were in Perbill-land, now back to integer
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
			logs,
			onInitialize,
			extrinsics,
			onFinalize,
		};
	}

	async fetchBalance(hash: BlockHash, address: string) {
		const api = await this.ensureMeta(hash);

		const [header, locks, sysAccount] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.balances.locks.at(hash, address),
			api.query.system.account.at(hash, address),
		]);

		const account = sysAccount.data != null
			? sysAccount.data :
			await api.query.balances.account.at(hash, address);

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
				error: "Account not found",
			};
		}
	}

	async fetchStakingLedger(hash: BlockHash, address: string) {
		const api = await this.ensureMeta(hash);

		const [header, staking] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.staking.ledger.at(hash, address),
		]);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		return {
			at,
			staking: staking.isNone ? {} : staking,
		}
	}

	async fetchVesting(hash: BlockHash, address: string) {
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
			vesting: vesting.isNone ? {} : vesting,
		}
	}

	async fetchMetadata(hash: BlockHash) {
		const api = await this.ensureMeta(hash);

		const metadata = await api.rpc.state.getMetadata(hash);

		return metadata;
	}

	async fetchClaimsInfo(hash: BlockHash, ethAddress: string) {
		const api = await this.ensureMeta(hash);
		const agreementType = await api.query.claims.signing.at(hash, ethAddress);
		if (agreementType.isEmpty) {
			return null;
		}

		return {
			type: agreementType.toString(),
		};
	}

	async fetchTxArtifacts(hash: BlockHash) {
		const api = await this.ensureMeta(hash);

		const [header, metadata, genesisHash, version] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.rpc.state.getMetadata(hash),
			api.rpc.chain.getBlockHash(0),
			api.rpc.state.getRuntimeVersion(hash),
		]);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		return {
			at,
			genesisHash,
			specVersion: version.specVersion,
			txVersion: version.transactionVersion,
			metadata: metadata.toHex(),
		};
	}

	async fetchPayoutInfo(hash: BlockHash, address: string) {
		const api = await this.ensureMeta(hash);

		let [header, rewardDestination, bonded] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.staking.payee.at(hash, address),
			api.query.staking.bonded.at(hash, address),
		]);

		const at = {
			hash,
			height: header.number.toNumber().toString(10),
		};

		return {
			at,
			rewardDestination,
			bonded,
		};
	}

	async submitTx(extrinsic: string) {
		const api = await this.resetMeta();

		let tx;

		try {
			tx = api.tx(extrinsic);
		} catch (err) {
			throw {
				error: 'Failed to parse a tx',
				data: extrinsic,
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
				cause: err.toString(),
			}
		}
	}

	private async fetchEvents(api: ApiPromise, hash: BlockHash): Promise<EventRecord[] | string> {
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
			if (!this.txVersion.eq(blockTxVersion) && this.specVersion.eq(blockSpecVersion)) {
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
					getSpecTypes(api.registry, chain, version.specName, blockSpecVersion)
				);
				api.registry.setMetadata(meta);
			}
		} catch (err) {
			console.error(`Failed to get Metadata for block ${hash}, using latest.`);
			console.error(err);
			this.specVersion = api.createType('u32', -1);
			this.txVersion = api.createType('u32', -1);
		}

		return api;
	}
}
