import { westendBadStakingBlocks } from './westmintBadStakingBlocks';

export const badStakingBlocks: Record<string, Set<number>> = {
	westmint: new Set(westendBadStakingBlocks),
};

export const isBadStakingBlock = (specName: string, blockNumber: number): boolean => {
	const badBlocks = badStakingBlocks[specName];
	if (!badBlocks) {
		return false;
	}

	return badBlocks.has(blockNumber);
};
