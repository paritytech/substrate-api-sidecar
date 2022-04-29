import { Registry } from '@polkadot/types-codec/types';

export interface ISanitizeOptions {
	metadataOpts?: IMetadataOptions;
}

export interface IMetadataOptions {
	registry: Registry;
	version: number;
}
