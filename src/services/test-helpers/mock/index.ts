import { Hash } from '@polkadot/types/interfaces';
import { Codec, CodecArg } from '@polkadot/types/types';

export * from './addresses';
export * from './mockApi';
export * from './mockBlock789629';
export * from './transactions';

/**
 * Convenience type for type casting mockApi storage querys.
 */
export type PolkadotStorageQuery = <T extends unknown = Codec>(
	hash: string | Hash | Uint8Array,
	arg1?: CodecArg,
	arg2?: CodecArg
) => Promise<T>;
