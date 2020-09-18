import { ApiPromise } from '@polkadot/api';
import { Text, Vec } from '@polkadot/types';

export abstract class AbstractService {
	constructor(protected api: ApiPromise) {}

	/**
	 * Process metadata documention.
	 *
	 * @param docs metadata doucumentation array
	 */
	protected sanitizeDocs(docs: Vec<Text>): string {
		return docs
			.map((l, idx, arr) =>
				idx === arr.length - 1 ? l.toString() : `${l.toString()}\n`
			)
			.join('');
	}
}
