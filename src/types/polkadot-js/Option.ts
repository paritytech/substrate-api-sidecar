import { Option } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';

export { Option } from '@polkadot/types';

/**
 * Check if something is a polkadot-js Option
 *
 * @param thing something that might be a polkadot-js Option
 */
export function isOption<T extends Codec>(thing: unknown): thing is Option<T> {
	return thing instanceof Option;
}
