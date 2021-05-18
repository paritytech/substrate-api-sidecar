import { ChainSpec } from '../types';
import { kusamaEndpoints } from './kusamaEndpoints';
import { polkadotEndpoints } from './polkadotEndpoints';
import { westendEndpoints } from './westendEndpoints';

export const endpoints: Record<ChainSpec, string[][]> = {
	kusama: kusamaEndpoints,
	polkadot: polkadotEndpoints,
	westend: westendEndpoints,
};
