import type { Codec } from '@polkadot/types/types';

export type { Codec } from '@polkadot/types/types';

export function isCodec(thing: unknown): thing is Codec {
	// Null errors on .hash access so we do not check for .hash

	return (
		!!thing &&
		(thing as Codec).encodedLength !== undefined &&
		(thing as Codec).registry !== undefined &&
		(thing as Codec).isEmpty !== undefined &&
		typeof (thing as Codec).eq === 'function' &&
		typeof (thing as Codec).toHex === 'function' &&
		typeof (thing as Codec).toHuman === 'function' &&
		typeof (thing as Codec).toJSON === 'function' &&
		typeof (thing as Codec).toRawType === 'function' &&
		typeof (thing as Codec).toString === 'function' &&
		typeof (thing as Codec).toU8a === 'function'
	);
}
