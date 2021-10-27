/**
 * String literal for specific chains that are being tested for
 */
export type ChainSpec = 'polkadot' | 'kusama' | 'westend' | 'statemine';

/**
 * Sidecar endpoints that are supported
 */
export type EndpointSpec = 'blocks' | 'accounts' | 'runtime' | 'paras';

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

/**
 * All chains that are supported to test against
 */
export interface IChains {
	kusama: ChainEndpoints;
	polkadot: ChainEndpoints;
	westend: ChainEndpoints;
	statemine: ChainEndpoints;
}
