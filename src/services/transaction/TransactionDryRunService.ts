import { BlockHash } from '@polkadot/types/interfaces';

import {
	ITransactionDryRun,
	TransactionResultType,
	ValidityErrorType,
} from '../../types/responses';
import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

export class TransactionDryRunService extends AbstractService {
	async dryRuntExtrinsic(
		hash: BlockHash,
		transaction: string
	): Promise<ITransactionDryRun> {
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
				transaction,
				cause,
				stack,
			};
		}
	}
}
