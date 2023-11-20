/**
 * When checking the cache there are 3 possible choices to return.
 */
enum QueryFee {
	/**
	 * queryFeeDetails is available
	 */
	available = 'available',
	/**
	 * queryFeeDetails is not available
	 */
	notAvailable = 'notAvailable',
	/**
	 * We dont know is queryFeeDetails is available
	 */
	unknown = 'unknown',
}

/**
 * Note: This cache is necessary as a work around since there is no way to find out
 * if TransactionPaymentApi::query_feeDetails is an available call. The runtimeApi version
 * was not bumped when query_feeDetails was added, therefore polkadot-js will error if it
 * is called when it doesn't exist.
 */
export class QueryFeeDetailsCache {
	/**
	 * Highest known runtime that doesn't have queryFeeDetails.
	 */
	private _registerWithoutCall;
	/**
	 * Lowest known runtime that has queryFeeDetails.
	 */
	private _registerWithCall;

	constructor(registerWithoutCall: number | null, registerWithCall: number | null) {
		this._registerWithoutCall = registerWithoutCall;
		this._registerWithCall = registerWithCall;
	}

	/**
	 * Checks whether the current runtime version has access to the runtime API: `TransactionPaymentApi`
	 *
	 * @param specVersion Current specVersion to check.
	 */
	public hasQueryFeeDetails(specVersion: number) {
		const { available, notAvailable, unknown } = QueryFee;

		if (this._registerWithCall !== null && specVersion >= this._registerWithCall) {
			return available;
		}

		if (this._registerWithoutCall !== null && specVersion <= this._registerWithoutCall) {
			return notAvailable;
		}

		return unknown;
	}

	/**
	 * Set the _registerWithoutCall. This would represent the highest
	 * known runtime that doesn't have queryFeeDetails.
	 *
	 * @param specVersion Current specVersion being called.
	 */
	public setRegisterWithoutCall(specVersion: number) {
		if (this._registerWithoutCall === null) {
			this._registerWithoutCall = specVersion;
		} else if (specVersion > this._registerWithoutCall) {
			this._registerWithoutCall = specVersion;
		}
	}

	/**
	 * Set the _registerWithCall. This would represent the lowest known
	 * runtime that has queryFeeDetails.
	 *
	 * @param specVersion Current specVersion being called.
	 */
	public setRegisterWithCall(specVersion: number) {
		if (this._registerWithCall === null) {
			this._registerWithCall = specVersion;
		} else if (specVersion < this._registerWithCall) {
			this._registerWithCall = specVersion;
		}
	}
}
