/**
 * The core of sidecar errors that pre-date the introduction of http-error.
 */
export interface IBasicLegacyError {
	error: string;
}

/**
 * Type guard to check if something is a subset of the interface BasicError.
 *
 * @param thing to check type of
 */
export function isBasicLegacyError(thing: unknown): thing is IBasicLegacyError {
	return (thing as IBasicLegacyError).error !== undefined;
}
