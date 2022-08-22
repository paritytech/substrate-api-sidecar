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
	private _versionWithoutCall;
	/**
	 * Lowest known runtime that has queryFeeDetails
	 */
	private _versionWithCall;

	constructor(
		versionWithoutCall: number | null,
		versionWithCall: number | null
	) {
		this._versionWithoutCall = versionWithoutCall;
		this._versionWithCall = versionWithCall;
	}

	public isQueryFeeDetailsAvail(specVersion: number) {
		const { available, notAvailable, unknown } = QueryFee;

		if (
			this._versionWithCall !== null &&
			specVersion >= this._versionWithCall
		) {
			return available;
		}

		if (
			this._versionWithoutCall !== null &&
			specVersion <= this._versionWithoutCall
		) {
			return notAvailable;
		}

		return unknown;
	}

	public setVersionWithoutCall(specVersion: number) {
		if (this._versionWithoutCall === null) {
			this._versionWithoutCall = specVersion;
		}
		if (specVersion > this._versionWithoutCall) {
			this._versionWithoutCall = specVersion;
		}
	}

	public setVersionWithCall(specVersion: number) {
		if (this._versionWithCall === null) {
			this._versionWithCall = specVersion;
		}
		if (specVersion < this._versionWithCall) {
			this._versionWithCall = specVersion;
		}
	}
}
