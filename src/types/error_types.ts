export interface IBasicError {
	error: string;
}

export interface ILegacyError extends IBasicError {
	statusCode: number;
}

export interface ITxError extends IBasicError {
	data?: string; // extrinsic
	cause: string;
}
