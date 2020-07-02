/**
 * The core of sidecar errors that pre-date the introduction of http-error.
 */
export interface BasicError {
	error: string;
}

/**
 * Format of some older error messages.
 */
export interface LegacyError extends BasicError {
	statusCode: number;
}

/**
 * Error from tx POST methods
 */
export interface TxError extends BasicError {
	data?: string; // extrinsic
	cause: string;
}
