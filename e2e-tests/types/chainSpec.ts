/**
 * String literal for specific chains that are being tested for
 */
export type ChainSpec = 'polkadot' | 'kusama' | 'westend';
export type EndpointSpec = 'blocks';

/**
 * Chain object and the associated endpoints
 */
export type ChainEndpoints = Record<EndpointSpec, string[][]>;

/**
 * Chain Config that is passed into the env
 */
export interface IEnvChainConfig {
	chain: string;
}

export interface IChains {
	kusama: ChainEndpoints,
	polkadot: ChainEndpoints,
	westend: ChainEndpoints
}
