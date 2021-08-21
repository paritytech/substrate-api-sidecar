import LRU from 'lru-cache';

import { IBlock } from '../../types/responses';

export const initLRUCache = (): LRU<string, IBlock> => {
	const config = { max: 2 };
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const cache = new LRU(config) as LRU<string, IBlock>;

	return cache;
};
