import { IBasicLegacyError } from './BasicLegacyError';

/**
 * Error from tx POST methods
 */
export interface ITxLegacyError extends IBasicLegacyError {
	data?: string; // deprecated
	transaction?: string;
	cause: string | unknown;
	stack: string;
}

/**
 * Type guard to check if something is a subset of the interface TxError.
 *
 * @param thing to check type of
 */
export function isTxLegacyError(thing: unknown): thing is ITxLegacyError {
	return (
		(thing as ITxLegacyError).cause !== undefined &&
		(thing as ITxLegacyError).error !== undefined
	);
}
