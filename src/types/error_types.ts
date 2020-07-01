export interface LegacyError extends BasicError {
	statusCode: number;
}

export interface BasicError {
	error: string;
}
