import { ErrorRequestHandler, Request, Response } from 'express';

/**
 * Empty mock Express Request.
 */
const mockReq = {} as Request;

/**
 * Assert that a middleware function (`ware`) calls `next` when passed `err`.
 *
 * @param ware the error handling middleware to test
 * @param name name of the error type
 * @param err error
 */
export const callsNextWithErr = (ware: ErrorRequestHandler) => (
	name: string,
	err: unknown
): void => {
	it(`calls next on error of type ${name}`, () => {
		const next = jest.fn();
		const send = jest.fn();
		const status = jest.fn((_code: number) => {
			return {
				send,
			};
		});

		ware(
			err,
			mockReq,
			({ headersSent: false, status } as unknown) as Response,
			next
		);
		expect(status).not.toBeCalled();
		expect(send).not.toBeCalled();
		expect(next).toBeCalledTimes(1);
	});
};

/**
 * Assert that a middleware function (`ware`) will catch `err` and set status to
 * `code`.
 *
 * @param ware the error handling middleware to test
 * @param name name of the error type
 * @param err error
 * @param code expected code to be sent as status
 */
export const catchesErrWithStatus = (ware: ErrorRequestHandler) => (
	name: string,
	err: unknown,
	code: number
): void => {
	it(`catches ${name} and sends status code ${code}`, () => {
		const next = jest.fn();
		const send = jest.fn();
		const status = jest.fn((_code: number) => {
			return {
				send,
			};
		});

		ware(
			err,
			mockReq,
			({ headersSent: false, status } as unknown) as Response,
			next
		);
		expect(send).toBeCalledTimes(1);
		expect(status).toBeCalledWith<[number]>(code);
		expect(status).toBeCalledTimes(1);
		expect(next).not.toBeCalled();
	});
};

/**
 * Assert that a middleware function (`ware`) will catch `err`, set status to
 * `code`, and send `response`.
 *
 * @param ware the error handling middleware to test
 * @param name name of the error type
 * @param err error
 * @param code expected code to be sent as status
 * @param response expected response body
 */
export const catchesErrWithResponse = (ware: ErrorRequestHandler) => (
	name: string,
	err: unknown,
	code: number,
	response: unknown
): void => {
	it(`catches ${name} and sends status code ${code}`, () => {
		const next = jest.fn();
		const send = jest.fn();
		const status = jest.fn((_code: number) => {
			return {
				send,
			};
		});

		ware(
			err,
			mockReq,
			({ headersSent: false, status } as unknown) as Response,
			next
		);
		expect(send).toBeCalledTimes(1);
		expect(send).toBeCalledWith(response);
		expect(status).toBeCalledWith<[number]>(code);
		expect(status).toBeCalledTimes(1);
		expect(next).not.toBeCalled();
	});
};

export function callsNextWithSentHeaders(
	ware: ErrorRequestHandler,
	err: unknown
): void {
	it('calls next if the headers have been sent', () => {
		const next = jest.fn();
		const send = jest.fn();
		const status = jest.fn((_code: number) => {
			return {
				send,
			};
		});

		ware(
			err,
			mockReq,
			({ headersSent: true, status } as unknown) as Response,
			next
		);
		expect(send).not.toBeCalled();
		expect(status).not.toBeCalled();
		expect(next).toBeCalledTimes(1);
	});
}
