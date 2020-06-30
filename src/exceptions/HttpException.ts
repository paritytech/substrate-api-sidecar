/**
 * Base class for creating exceptions.
 */
export default class HttpException extends Error {
	readonly statusCode: number;
	readonly statusMessage: string;
	/**
	 * Construct a generic Http Exception
	 *
	 * @param statusCode http status code
	 * @param statusMessage error status message
	 */
	constructor(statusCode: number, statusMessage: string) {
		super();
		this.statusCode = statusCode;
		this.statusMessage = statusMessage;
	}
}
