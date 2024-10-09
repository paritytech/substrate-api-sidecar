/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

import { SubmittableExtrinsic } from '@polkadot/api/types';
import type { GenericExtrinsicPayload } from '@polkadot/types/extrinsic';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import type { BlockHash, CallDryRunEffects, Header, XcmDryRunApiError } from '@polkadot/types/interfaces';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Result } from '@polkadot/types-codec';

import { ITransactionDryRun, TransactionResultType } from '../../types/responses';
import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export type SignedOriginCaller = {
	System: {
		Signed: string;
	};
};

export type Format = 'payload' | 'call' | 'submittable';

/**
 * The Format types possible for a constructed transaction.
 */
export type ConstructedFormat<T> = T extends 'payload'
	? GenericExtrinsicPayload
	: T extends 'call'
	  ? `0x${string}`
	  : T extends 'submittable'
	    ? SubmittableExtrinsic<'promise', ISubmittableResult>
	    : never;

export class TransactionDryRunService extends AbstractService {
	async dryRuntExtrinsic<T extends Format>(
		hash: BlockHash,
		senderAddress: string,
		transaction: ConstructedFormat<T>,
		format: T,
	): Promise<ITransactionDryRun> {
		const { api } = this;

		try {
			const originCaller: SignedOriginCaller = {
				System: {
					Signed: senderAddress,
				},
			};
			// let dryRunResponse: Result<CallDryRunEffects, XcmDryRunApiError> | null = null;

			const promises: Promise<Result<CallDryRunEffects, XcmDryRunApiError> | Header>[] = [];

			if (format === 'payload') {
				const extrinsicPayload = api.registry.createType('ExtrinsicPayload', transaction, {
					version: EXTRINSIC_VERSION,
				});
				const call = api.registry.createType('Call', extrinsicPayload.method);

				promises.push(api.call.dryRunApi.dryRunCall(originCaller, call.toHex()));
			} else if (format === 'call' || format === 'submittable') {
				promises.push(api.call.dryRunApi.dryRunCall(originCaller, transaction));
			}

			const [dryRunResponse, header] = await Promise.all([...promises, api.rpc.chain.getHeader(hash)]);

			let dryRunResult;

			if (dryRunResponse && 'isOk' in dryRunResponse) {
				if (dryRunResponse.isOk) {
					dryRunResult = {
						resultType: TransactionResultType.DispatchOutcome,
						result: dryRunResponse?.asOk,
					};
				} else {
					dryRunResult = {
						resultType: TransactionResultType.TransactionValidityError,
						result: dryRunResponse?.asErr,
						validityErrorType: dryRunResponse?.asErr.type,
					};
				}
			}
			const { number } = header as Header;

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
