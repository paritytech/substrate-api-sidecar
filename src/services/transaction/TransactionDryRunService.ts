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
 * 		- `resultType`: Either `DispatchOutcome` if the construction is valid
 * 			or `TransactionValidityError` if the transaction has invalid construction.
 * 		- `result`: If there was an error it will be the cause of the error. If the
 * 			transaction executed correctly it will be `Ok: []`.
 * 		- `validityErrorType`: Only present if the `resultType` is
 * 			`TransactionValidityError`. Either `InvalidTransaction` or `UnknownTransaction`.
 *
 * References:
 * - `UnknownTransaction`: https://crates.parity.io/sp_runtime/transaction_validity/enum.UnknownTransaction.html
 * - `InvalidTransaction`: https://crates.parity.io/sp_runtime/transaction_validity/enum.InvalidTransaction.html
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
