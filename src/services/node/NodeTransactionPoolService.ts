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

import { u64 } from '@polkadot/types';
import { DispatchClass, Extrinsic, Weight, WeightV1, WeightV2 } from '@polkadot/types/interfaces';
import BN from 'bn.js';

import { INodeTransactionPool } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class NodeTransactionPoolService extends AbstractService {
	/**
	 * Fetch the transaction pool, and provide relevant extrinsic information.
	 *
	 * @param includeFee Whether or not to include the fee's and priority of a extrinsic
	 * in the transaction pool.
	 */
	public async fetchTransactionPool(includeFee: boolean): Promise<INodeTransactionPool> {
		const { api } = this;
		const extrinsics = await api.rpc.author.pendingExtrinsics();

		if (includeFee) {
			const pool = await Promise.all(extrinsics.map((ext) => this.extractExtrinsicInfo(ext)));

			return {
				pool,
			};
		} else {
			return {
				pool: extrinsics.map((ext) => {
					return {
						hash: ext.hash.toHex(),
						encodedExtrinsic: ext.toHex(),
					};
				}),
			};
		}
	}

	/**
	 * Extract all information related to the extrinsic, and compute it's
	 * priority in the transaction pool.
	 *
	 * @param ext Extrinsic we want to provide all the information for.
	 */
	private async extractExtrinsicInfo(ext: Extrinsic) {
		const { api } = this;
		const { hash, tip } = ext;
		const u8a = ext.toU8a();
		const { class: c, partialFee, weight } = await api.call.transactionPaymentApi.queryInfo(u8a, u8a.length);
		const priority = await this.computeExtPriority(ext, c, weight);

		return {
			hash: hash.toHex(),
			encodedExtrinsic: ext.toHex(),
			tip: tip.toString(),
			priority: priority,
			partialFee: partialFee,
		};
	}

	/**
	 * We calculate the priority of an extrinsic in the transaction pool depending
	 * on its dispatch class, ie. 'normal', 'operational', 'mandatory'.
	 *
	 * The following formula can summarize the below logic.
	 * tip * (max_block_{weight|length} / bounded_{weight|length})
	 *
	 * Please reference this link for more information
	 * ref: https://github.com/paritytech/substrate/blob/fe5bf49290d166b9552f65e751d46ec592173ebd/frame/transaction-payment/src/lib.rs#L610
	 *
	 * @param ext
	 * @param c
	 * @param weight
	 */
	private async computeExtPriority(
		ext: Extrinsic,
		dispatchClass: DispatchClass,
		weight: Weight | WeightV1,
	): Promise<string> {
		const { api } = this;
		const { tip, encodedLength: len } = ext;
		const BN_ONE = new BN(1);
		const sanitizedClass = this.defineDispatchClassType(dispatchClass);

		// Check which versions of Weight we are using by checking to see if refTime exists.
		const versionedWeight = weight['refTime']
			? (weight as unknown as WeightV2).refTime.unwrap().toBn()
			: (weight as WeightV1).toBn();
		const maxBlockWeight = api.consts.system.blockWeights.maxBlock.refTime
			? api.consts.system.blockWeights.maxBlock.refTime.unwrap()
			: (api.consts.system.blockWeights.maxBlock as unknown as u64);
		const maxLength: BN = new BN(api.consts.system.blockLength.max[sanitizedClass]);

		const boundedWeight = BN.min(BN.max(versionedWeight, BN_ONE), new BN(maxBlockWeight));

		const boundedLength = BN.min(BN.max(new BN(len), BN_ONE), maxLength);
		const maxTxPerBlockWeight = maxBlockWeight.toBn().div(boundedWeight);
		const maxTxPerBlockLength = maxLength.div(boundedLength);

		const maxTxPerBlock = BN.min(maxTxPerBlockWeight, maxTxPerBlockLength);
		const saturatedTip = tip.toBn().add(BN_ONE);
		const scaledTip = this.maxReward(saturatedTip, maxTxPerBlock);

		let priority: string;
		switch (sanitizedClass) {
			case 'normal': {
				priority = scaledTip.toString();
				break;
			}
			case 'mandatory': {
				priority = scaledTip.toString();
				break;
			}
			case 'operational': {
				const u8a = ext.toU8a();
				const { inclusionFee } = await api.call.transactionPaymentApi.queryFeeDetails(u8a, u8a.length);
				const { operationalFeeMultiplier } = api.consts.transactionPayment;

				if (inclusionFee.isNone) {
					// This is an unsigned_extrinsic, and does not have priority
					priority = '0';
					break;
				}

				const { baseFee, lenFee, adjustedWeightFee } = inclusionFee.unwrap();
				const computedInclusionFee = baseFee.toBn().add(lenFee).add(adjustedWeightFee);
				const finalFee = computedInclusionFee.add(tip.toBn());
				const virtualTip = finalFee.mul(operationalFeeMultiplier);
				const scaledVirtualTip = this.maxReward(virtualTip, maxTxPerBlock);

				priority = scaledTip.add(scaledVirtualTip).toString();
				break;
			}
			default: {
				priority = '0';
				break;
			}
		}

		return priority;
	}

	/**
	 * Explicitly define the type of class an extrinsic is.
	 *
	 * @param c DispatchClass of an extrinsic
	 */
	private defineDispatchClassType(c: DispatchClass): 'normal' | 'mandatory' | 'operational' {
		const cString = c.type.toLowerCase();
		if (cString === 'normal') return 'normal';
		if (cString === 'mandatory') return 'mandatory';
		if (cString === 'operational') return 'operational';

		// This will never be reached, but is here to satisfy the TS compiler.
		return 'normal';
	}

	/**
	 * Multiply a value (tip) by its maxTxPerBlock multiplier.
	 * ref: https://github.com/paritytech/substrate/blob/fe5bf49290d166b9552f65e751d46ec592173ebd/frame/transaction-payment/src/lib.rs#L633
	 *
	 * @param val Value to be multiplied by the maxTxPerBlock. Usually a tip.
	 * @param maxTxPerBlock The minimum value between maxTxPerBlockWeight and maxTxPerBlockLength
	 */
	private maxReward(val: BN, maxTxPerBlock: BN): BN {
		return val.mul(maxTxPerBlock);
	}
}
