import { IBasicLegacyError } from 'src/types/error_types';

/**
 * Type guard to check if something is a subset of the interface BasicError.
 *
 * @param thing to check type of
 */
export function isBasicError(thing: unknown): thing is IBasicLegacyError {
	return (thing as IBasicLegacyError).error !== undefined;
}
