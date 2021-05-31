/**
 * String literal for specific chains that are being tested for
 */
export type ChainSpec = 'polkadot' | 'kusama' | 'westend';

/**
 *
 */
export interface ChainConfig {
	chain: string;
}
