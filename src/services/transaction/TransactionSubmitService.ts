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

import { Hash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export class TransactionSubmitService extends AbstractService {
	/**
	 * Submit a fully formed SCALE-encoded extrinsic for block inclusion.
	 *
	 * @param extrinsic scale encoded extrinsic to submit
	 */
	async submitTransaction(transaction: string): Promise<{ hash: Hash }> {
		const { api } = this;

		let tx;

		try {
			tx = api.tx(transaction);
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				code: 400,
				error: 'Failed to parse transaction.',
				transaction,
				cause,
				stack,
			};
		}

		try {
			const hash = await api.rpc.author.submitExtrinsic(tx);

			return {
				hash,
			};
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				code: 400,
				error: 'Failed to submit transaction.',
				transaction,
				cause,
				stack,
			};
		}
	}
}
