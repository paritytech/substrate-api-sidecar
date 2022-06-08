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

import { BlockHash, RuntimeDispatchInfo } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export class TransactionFeeEstimateService extends AbstractService {
	/**
	 * Fetch estimated fee information for a SCALE-encoded extrinsic at a given
	 * block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param extrinsic scale encoded extrinsic to get a fee estimate for
	 */
	async fetchTransactionFeeEstimate(
		hash: BlockHash,
		transaction: string
	): Promise<RuntimeDispatchInfo> {
		const { api } = this;

		try {
			return await api.rpc.payment.queryInfo(transaction, hash);
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				at: {
					hash: hash.toString(),
				},
				error: 'Unable to fetch fee info',
				transaction,
				cause,
				stack,
			};
		}
	}
}
