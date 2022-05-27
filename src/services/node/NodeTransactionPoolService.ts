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

import { CalcFee } from '@substrate/calc';
import BN from 'bn.js';
import { BadRequest } from 'http-errors';

import { INodeTransactionPool } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class NodeTransactionPoolService extends AbstractService {
	async fetchTransactionPool(
		includeFee: boolean
	): Promise<INodeTransactionPool> {
		const { api } = this;

		const extrinsics = await api.rpc.author.pendingExtrinsics();

		if (includeFee) {
			const calcFeeWithParams = await this.getFromParams();
			const weight = this.getWeight();

			if (!calcFeeWithParams) {
				throw new BadRequest(
					'This runtime does not have the sufficient materials to calculate fees.'
				);
			}

			return {
				pool: extrinsics.map((ext) => {
					const { hash, encodedLength, tip } = ext;
					const partialFee = calcFeeWithParams.calc_fee(
						// TODO This value comes from the success, failure events.
						BigInt(0),
						encodedLength,
						weight.toBigInt()
					);
					return {
						hash: hash.toHex(),
						encodedExtrinsic: ext.toHex(),
						tip: tip.toString(),
						totalFee: new BN(tip.toString()).add(new BN(partialFee)).toString(),
						partialFee,
					};
				}),
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

	private async getFromParams(): Promise<CalcFee | undefined> {
		const { specName, specVersion } =
			await this.api.rpc.state.getRuntimeVersion();

		const multiplier = await this.getMultiplier();
		const perByte = this.getPerByte();
		const weightToFee = this.getWeightToFee();

		const coefficients = weightToFee.map((c) => {
			return {
				// Anything that could overflow Number.MAX_SAFE_INTEGER needs to be serialized
				// to BigInt or string.
				coeffInteger: c.coeffInteger.toString(10),
				coeffFrac: c.coeffFrac.toNumber(),
				degree: c.degree.toNumber(),
				negative: c.negative,
			};
		});

		return CalcFee.from_params(
			coefficients,
			multiplier.toString(10),
			perByte.toString(10),
			specName.toString(),
			specVersion.toNumber()
		);
	}

	private async getMultiplier() {
		return await this.api.query.transactionPayment.nextFeeMultiplier();
	}

	private getPerByte() {
		return this.api.consts.transactionPayment.lengthToFee.toArray()[0]
			.coeffInteger;
	}

	private getWeight() {
		return this.api.consts.system.blockWeights.perClass.normal.baseExtrinsic;
	}

	private getWeightToFee() {
		return this.api.consts.transactionPayment.weightToFee;
	}
}
