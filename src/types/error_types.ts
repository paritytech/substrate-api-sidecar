/**
 * The core of sidecar errors that pre-date the introduction of http-error.
 */
export interface IBasicLegacyError {
	error: string;
}

/**
 * Format of some older error messages.
 */
export interface ILegacyError extends IBasicLegacyError {
	statusCode: number;
}

/**
 * Error from tx POST methods
 */
export interface ITxLegacyError extends IBasicLegacyError {
	data?: string; // extrinsic
	cause: string;
}
