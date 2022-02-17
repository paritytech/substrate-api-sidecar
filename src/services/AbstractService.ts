import { ApiPromise } from '@polkadot/api';
import { Text, Vec } from '@polkadot/types';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { BadRequest, HttpError } from 'http-errors';

export class EtheuremAddressNotSupported extends Error implements HttpError {
	public readonly status: number;
	public readonly statusCode: number;
	public readonly expose: boolean = true;
	public readonly name: string;

	constructor(msg: string) {
		super(`Etheurem addresses may not be supported on this network: ${msg}`);
		this.status = 400;
		this.statusCode = 400;
		this.name = EtheuremAddressNotSupported.name;
	}
}

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

	/**
	 * Returns HttpError with the correct err message for querying accounts balances.
	 *
	 * @function
	 * @param {string} address Address that was queried
	 * @param {Error} err Error returned from the promise
	 * @returns {HttpError}
	 */
	protected createHttpErrorForAddr(address: string, err: Error): HttpError {
		if (isEthereumAddress(address)) {
			return new EtheuremAddressNotSupported(err.message);
		}

		return new BadRequest(err.message);
	}
}
