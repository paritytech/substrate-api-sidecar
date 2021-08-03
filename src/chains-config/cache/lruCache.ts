import LRU from 'lru-cache';

export const initLRUCache = (): LRU<unknown, unknown> => {
	const config = { max: 2 },
		cache = new LRU(config);

	return cache;
};
