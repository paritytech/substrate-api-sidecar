/**
 * The core of sidecar errors that pre-date the introduction of http-error.
 */
export interface IBasicError {
	error: string;
}

/**
 * Format of some older error messages.
 */
export interface ILegacyError extends IBasicError {
	statusCode: number;
}

/**
 * Error from tx POST methods
 */
export interface ITxError extends IBasicError {
	data?: string; // extrinsic
	cause: string;
}
