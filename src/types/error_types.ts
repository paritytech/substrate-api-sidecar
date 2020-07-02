export interface BasicError {
	error: string;
}

export interface LegacyError extends BasicError {
	statusCode: number;
}

export interface TxError extends BasicError {
	data?: string; // extrinsic
	cause: string;
}
