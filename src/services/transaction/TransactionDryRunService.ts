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

import type { BlockHash, CallDryRunEffects, XcmDryRunApiError } from '@polkadot/types/interfaces';
import type { Result } from '@polkadot/types-codec';

import { ITransactionDryRun, TransactionResultType } from '../../types/responses';
import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export type SignedOriginCaller = {
	System: {
		Signed: string;
	};
};

export class TransactionDryRunService extends AbstractService {
	async dryRuntExtrinsic(
		senderAddress: string,
		transaction: `0x${string}`,
		hash?: BlockHash,
	): Promise<ITransactionDryRun> {
		const { api } = this;

		try {
			const originCaller: SignedOriginCaller = {
				System: {
					Signed: senderAddress,
				},
			};

			const [dryRunResponse, { number }] = await Promise.all([
				api.call.dryRunApi.dryRunCall(originCaller, transaction),
				hash ? api.rpc.chain.getHeader(hash) : { number: null },
			]);

			const response = dryRunResponse as Result<CallDryRunEffects, XcmDryRunApiError>;

			return {
				at: {
					hash: hash ? hash : '',
					height: number ? number.unwrap().toString(10) : '0',
				},
				result: {
					resultType: response.isOk
						? TransactionResultType.DispatchOutcome
						: TransactionResultType.TransactionValidityError,
					result: response.isOk ? response.asOk.executionResult.asOk : response.asErr,
				},
			};
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				at: {
					hash,
				},
				code: 400,
				error: 'Unable to dry-run transaction',
				transaction,
				cause,
				stack,
			};
		}
	}
}
