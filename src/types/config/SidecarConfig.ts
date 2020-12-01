import { AnyJson } from '@polkadot/types/types';

/**
 * Object to house the values of all the configurable components for Sidecar.
 */
export interface ISidecarConfig {
	EXPRESS: ISidecarConfigExpress;
	SUBSTRATE: ISidecarConfigSubstrate;
	LOG: ISidecarConfigLog;
}

interface ISidecarConfigSubstrate {
	WS_URL: string;
	CUSTOM_TYPES: AnyJson;
}

interface ISidecarConfigExpress {
	HOST: string;
	PORT: number;
}

interface ISidecarConfigLog {
	LEVEL: string;
	JSON: boolean;
	FILTER_RPC: boolean;
	STRIP_ANSI: boolean;
}
