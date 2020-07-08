export function parseBlockNumber(n: string): number {
	const num = Number(n);

	if (!Number.isInteger(num) || num < 0) {
		throw { error: 'Invalid block number' };
	}

	return num;
}
