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

import { BlockHash } from '@polkadot/types/interfaces';

import { ITransactionDryRun, TransactionResultType, ValidityErrorType } from '../../types/responses';
import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export class TransactionDryRunService extends AbstractService {
	async dryRuntExtrinsic(hash: BlockHash, transaction: string): Promise<ITransactionDryRun> {
		const { api } = this;

		try {
			const [applyExtrinsicResult, { number }] = await Promise.all([
				api.rpc.system.dryRun(transaction, hash),
				api.rpc.chain.getHeader(hash),
			]);

			let dryRunResult;
			if (applyExtrinsicResult.isOk) {
				dryRunResult = {
					resultType: TransactionResultType.DispatchOutcome,
					result: applyExtrinsicResult.asOk,
				};
			} else {
				const { asErr } = applyExtrinsicResult;
				dryRunResult = {
					resultType: TransactionResultType.TransactionValidityError,
					result: asErr.isInvalid ? asErr.asInvalid : asErr.asUnknown,
					validityErrorType: asErr.isInvalid ? ValidityErrorType.Invalid : ValidityErrorType.Unknown,
				};
			}

			return {
				at: {
					hash,
					height: number.unwrap().toString(10),
				},
				dryRunResult,
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
