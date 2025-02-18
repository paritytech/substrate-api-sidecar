// Copyright 2017-2025 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
export const callsNextWithErr =
	(ware: ErrorRequestHandler) =>
	(name: string, err: unknown): void => {
		it(`calls next on error of type ${name}`, async () => {
			const next = jest.fn();
			const send = jest.fn();
			const status = jest.fn((_code: number) => {
				return {
					send,
				};
			});

			await ware(err, mockReq, { headersSent: false, status } as unknown as Response, next);
			expect(status).not.toHaveBeenCalled();
			expect(send).not.toHaveBeenCalled();
			expect(next).toHaveBeenCalledTimes(1);
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
export const catchesErrWithStatus =
	(ware: ErrorRequestHandler) =>
	(name: string, err: unknown, code: number): void => {
		it(`catches ${name} and sends status code ${code}`, async () => {
			const next = jest.fn();
			const send = jest.fn();
			const status = jest.fn((_code: number) => {
				return {
					send,
				};
			});

			await ware(err, mockReq, { headersSent: false, status } as unknown as Response, next);
			expect(send).toHaveBeenCalledTimes(1);
			expect(status).toHaveBeenCalledWith<[number]>(code);
			expect(status).toHaveBeenCalledTimes(1);
			expect(next).not.toHaveBeenCalled();
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
export const catchesErrWithResponse =
	(ware: ErrorRequestHandler) =>
	(name: string, err: unknown, code: number, response: unknown): void => {
		it(`catches ${name} and sends status code ${code}`, async () => {
			const next = jest.fn();
			const send = jest.fn();
			const status = jest.fn((_code: number) => {
				return {
					send,
				};
			});

			await ware(err, mockReq, { headersSent: false, status } as unknown as Response, next);
			expect(send).toHaveBeenCalledTimes(1);
			expect(send).toHaveBeenCalledWith(response);
			expect(status).toHaveBeenCalledWith<[number]>(code);
			expect(status).toHaveBeenCalledTimes(1);
			expect(next).not.toHaveBeenCalled();
		});
	};

export function callsNextWithSentHeaders(ware: ErrorRequestHandler, err: unknown): void {
	it('calls next if the headers have been sent', async () => {
		const next = jest.fn();
		const send = jest.fn();
		const status = jest.fn((_code: number) => {
			return {
				send,
			};
		});

		await ware(err, mockReq, { headersSent: true, status } as unknown as Response, next);
		expect(send).not.toBeCalled();
		expect(status).not.toBeCalled();
		expect(next).toBeCalledTimes(1);
	});
}
