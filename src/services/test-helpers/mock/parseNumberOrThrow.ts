import { BadRequest } from 'http-errors';

export function parseNumberOrThrow(n: string, errorMessage: string): number {
	const num = Number(n);

	if (!Number.isInteger(num) || num < 0) {
		throw new BadRequest(errorMessage);
	}

	return num;
}
