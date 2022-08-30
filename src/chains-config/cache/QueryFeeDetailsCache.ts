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

export class QueryFeeDetailsCache {
	/**
	 * Highest known runtime that doesn't have queryFeeDetails.
	 */
	private _registerWithoutCall;
	/**
	 * Lowest known runtime that has queryFeeDetails.
	 */
	private _registerWithCall;

	constructor(
		registerWithoutCall: number | null,
		registerWithCall: number | null
	) {
		this._registerWithoutCall = registerWithoutCall;
		this._registerWithCall = registerWithCall;
	}

	public isQueryFeeDetailsAvail(specVersion: number) {
		const { available, notAvailable, unknown } = QueryFee;

		if (
			this._registerWithCall !== null &&
			specVersion >= this._registerWithCall
		) {
			return available;
		}

		if (
			this._registerWithoutCall !== null &&
			specVersion <= this._registerWithoutCall
		) {
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
