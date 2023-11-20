// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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

import { Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';

/**
 * Assert that a middleware does not error with the given request.
 *
 * @param name String for tests to log.
 * @param req Express Request containing thing it errors on.
 */
export const doesNotErrorWith = (name: string, req: Request, middleware: RequestHandler): void => {
	it(`does not error with ${name}`, () => {
		const next = jest.fn();
		middleware(req, null as unknown as Response, next);
		expect(next).toBeCalledTimes(1);
		expect(next).toBeCalledWith();
	});
};

/**
 * Assert that a middleware passes `err` to next with the given
 * `req`.
 *
 * @param name String for tests to log.
 * @param req Express Request containing thing it errors on.
 * @param err Expected error that it passes to next.
 */
export const errorsWith = (name: string, req: Request, err: unknown, middleware: RequestHandler): void => {
	it(`errors with ${name}`, () => {
		const next = jest.fn();

		middleware(req, null as unknown as Response, next);
		expect(next).toBeCalledTimes(1);
		expect(next).toBeCalledWith(err);
	});
};
