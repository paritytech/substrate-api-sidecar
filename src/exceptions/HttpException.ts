/**
 * Base class for creating exceptions that can be used as a response
 */
export default class HttpException extends Error {
	readonly statusCode: number;
	readonly message: string;
	constructor(statusCode: number, message: string) {
		super();
		this.statusCode = statusCode;
		this.message = message;
	}
}
