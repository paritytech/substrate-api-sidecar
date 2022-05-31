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

import { Extrinsic } from '@polkadot/types/interfaces';
import { u32 } from '@polkadot/types-codec';
import BN from 'bn.js';

import { INodeTransactionPool } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class NodeTransactionPoolService extends AbstractService {
	async fetchTransactionPool(
		includeFee: boolean
	): Promise<INodeTransactionPool> {
		const { api } = this;
		const extrinsics = await api.rpc.author.pendingExtrinsics();

		if (includeFee) {
			const pool = await Promise.all(
				extrinsics.map((ext) => this.extractExtrinsicInfo(ext))
			);

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
	 * tip * (max_block_{weight|length} / bounded_{weight|length})
	 * ref: https://github.com/paritytech/substrate/blob/fe5bf49290d166b9552f65e751d46ec592173ebd/frame/transaction-payment/src/lib.rs#L610
	 * @param ext
	 * @returns
	 */
	private async extractExtrinsicInfo(ext: Extrinsic) {
		const { hash, tip } = ext;
		const {
			class: c,
			partialFee,
			weight,
		} = await this.api.rpc.payment.queryInfo(ext.toHex());
		const len = ext.encodedLength; // TODO Confirm that this is correct
		const BN_ONE = new BN(1);

		const { maxBlock } = this.api.consts.system.blockWeights;
		const maxLength: u32 =
			this.api.consts.system.blockLength.max[c.type.toLowerCase()];
		const boundedWeight = BN.min(BN.max(weight.toBn(), BN_ONE), maxBlock);
		const boundedLength = BN.min(BN.max(new BN(len), BN_ONE), maxLength);
		const maxTxPerBlockWeight = maxBlock.div(boundedWeight);
		const maxTxPerBlockLength = maxLength.div(boundedLength);

		const maxTxPerBlock = BN.min(maxTxPerBlockWeight, maxTxPerBlockLength);
		const saturatedTip = tip.toBn().add(BN_ONE);
		const scaledTip = saturatedTip.mul(maxTxPerBlock);

		let priority: string;
		switch (c.type.toLowerCase()) {
			case 'normal':
				priority = scaledTip.toString();
				break;
			case 'mandatory': // This is not necessary as mandatories wont be in the pool
				priority = scaledTip.toString();
				break;
			case 'operational':
				priority = '';
				break;
			default:
				priority = '';
				break;
		}

		return {
			hash: hash.toHex(),
			encodedExtrinsic: ext.toHex(),
			tip: tip.toString(),
			priority: priority, // TODO set it to a BN return type
			partialFee: partialFee.toString(), // TODO remove toString(), and replace with Balance
		};
	}
}
