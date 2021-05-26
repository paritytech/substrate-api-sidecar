import { ChainSpec } from '../types';
import { kusamaEndpoints } from './kusama';
import { polkadotEndpoints } from './polkadot';
import { westendEndpoints } from './westend';

export const endpoints: Record<ChainSpec, string[][]> = {
	kusama: kusamaEndpoints,
	polkadot: polkadotEndpoints,
	westend: westendEndpoints,
};
