// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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
import type { BlockHash, CallDryRunEffects, XcmDryRunApiError } from '@polkadot/types/interfaces';
import type { Option, Result, u32 } from '@polkadot/types-codec';
import { BadRequest } from 'http-errors';

import { ITransactionDryRun, TransactionResultType, ValidityErrorType } from '../../types/responses';
import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export type SignedOriginCaller = {
	System: {
		Signed: string;
	};
};

export class TransactionDryRunService extends AbstractService {
	async dryRuntExtrinsic(
		api: ApiPromise,
		senderAddress: string,
		transaction: `0x${string}`,
		hash?: BlockHash,
		xcmVersion?: number | undefined,
	): Promise<ITransactionDryRun> {
		if (!api.call.dryRunApi) {
			throw new BadRequest('DryRunApi not found in metadata.');
		} else if (!api.call.dryRunApi.dryRunCall) {
			throw new BadRequest('dryRunCall not found in metadata.');
		}
		// We can assume we have the DryRunApi and dry_run_call since we check the api above.
		const hasXcmParam = api.registry.metadata.apis
			.find((a) => a.name.toString() === 'DryRunApi')!
			.methods.find((method) => method.name.toString() === 'dry_run_call')!
			.inputs.find((p) => p.name.toString() === 'result_xcms_version');

		let foundXcmVersion = xcmVersion;
		if (hasXcmParam && !foundXcmVersion && api.query.xcmPallet?.safeXcmVersion) {
			const version = await api.query.xcmPallet.safeXcmVersion<Option<u32>>();
			if (version.isNone) {
				throw BadRequest('No safe xcm version found on chain.');
			}

			foundXcmVersion = version.unwrap().toNumber();
		}

		try {
			const originCaller: SignedOriginCaller = {
				System: {
					Signed: senderAddress,
				},
			};

			const [dryRunResponse, { number }] = await Promise.all([
				!hasXcmParam
					? api.call.dryRunApi.dryRunCall(originCaller, transaction)
					: api.call.dryRunApi.dryRunCall(originCaller, transaction, foundXcmVersion),
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
						? response.asOk.executionResult.isOk
							? TransactionResultType.DispatchOutcome
							: TransactionResultType.DispatchError
						: ValidityErrorType.Invalid,
					result: response.isOk
						? response.asOk.executionResult.isOk
							? response.asOk.executionResult.asOk
							: response.asOk.executionResult.asErr
						: response.asErr,
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
