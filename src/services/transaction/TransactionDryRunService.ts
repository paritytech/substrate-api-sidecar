import { BlockHash } from '@polkadot/types/interfaces';

import {
	ITransactionDryRun,
	TransactionResultType,
	ValidityErrorType,
} from '../../types/responses';
import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

/**
 * Dry run an extrinsic.
 *
 * Returns:
 * - `at`:
 * 		- `hash`: The block's hash.
 * 		- `height`: The block's height.
 * - `dryRunResult`:
 * 		- `resultType`: Either `DispatchOutcome` if the transaction is valid or
 * 			`TransactionValidityError` if the result is invalid.
 * 		- `result`: If there was an error it will be the cause of the error. If the
 * 			transaction executed correctly it will be `Ok: []`.
 * 			or `TransactionValidityError` if the transaction is invalid.
 * 		- `validityErrorType`: Only present if the `resultType` is
 * 			`TransactionValidityError`. Either `InvalidTransaction` or `UnknownTransaction`.
 *
 * References:
 * - `UnknownTransaction`: https://github.com/paritytech/substrate/blob/master/primitives/runtime/src/transaction_validity.rs#L116
 * - `InvalidTransaction`: https://github.com/paritytech/substrate/blob/master/primitives/runtime/src/transaction_validity.rs#L37
 */
export class TransactionDryRunService extends AbstractService {
	async dryRuntExtrinsic(
		hash: BlockHash,
		extrinsic: string
	): Promise<ITransactionDryRun> {
		const api = await this.ensureMeta(hash);

		try {
			const [applyExtrinsicResult, { number }] = await Promise.all([
				api.rpc.system.dryRun(extrinsic, hash),
				api.rpc.chain.getHeader(hash),
			]);

			let dryRunResult;
			if (applyExtrinsicResult.isOk) {
				dryRunResult = {
					resultType: TransactionResultType.DispatchOutcome,
					result: applyExtrinsicResult.asOk,
				};
			} else {
				const { asError } = applyExtrinsicResult;
				dryRunResult = {
					resultType: TransactionResultType.TransactionValidityError,
					result: asError.isInvalid
						? asError.asInvalid
						: asError.asUnknown,
					validityErrorType: asError.isInvalid
						? ValidityErrorType.Invalid
						: ValidityErrorType.Unknown,
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
				error: 'Unable to dry-run transaction',
				extrinsic,
				cause,
				stack,
			};
		}
	}
}
