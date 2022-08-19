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
	private _highestKnown;
	/**
	 * Lowest known runtime that has queryFeeDetails
	 */
	private _lowestKnown;

	constructor(highestKnown: number | null, lowestKnown: number | null) {
		this._highestKnown = highestKnown;
		this._lowestKnown = lowestKnown;
	}

	public isQueryFeeDetailsAvail(specVersion: number) {
		const { available, notAvailable, unknown } = QueryFee;

		if (this._lowestKnown && specVersion >= this._lowestKnown) {
			return available;
		}

		if (this._highestKnown && specVersion <= this._highestKnown) {
			return notAvailable;
		}

		return unknown;
	}

	public setHighestKnownUnavailRuntime(specVersion: number) {
		if (!this._highestKnown) {
			this._highestKnown = specVersion;
		}
		if (this._highestKnown && this._highestKnown < specVersion) {
			this._highestKnown = specVersion;
		}
	}

	public setLowestKnownAvailRuntime(specVersion: number) {
		if (!this._lowestKnown) {
			this._lowestKnown = specVersion;
		}
		if (this._lowestKnown && specVersion > this._lowestKnown) {
			this._lowestKnown = specVersion;
		}
	}
}
