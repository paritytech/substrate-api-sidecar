import { ITxLegacyError } from '../types/error_types';

/**
 * Type guard to check if something is a subset of the interface TxError.
 *
 * @param thing to check type of
 */
export function isTxError(thing: unknown): thing is ITxLegacyError {
	return (
		(thing as ITxLegacyError).cause !== undefined &&
		(thing as ITxLegacyError).error !== undefined
	);
}
