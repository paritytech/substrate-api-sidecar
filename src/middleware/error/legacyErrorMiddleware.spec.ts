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

import { BadRequest, InternalServerError } from 'http-errors';
import HttpErrorConstructor from 'http-errors';

import { legacyErrorMiddleware } from './legacyErrorMiddleware';
import { callsNextWithErr, callsNextWithSentHeaders, catchesErrWithResponse } from './testTools';

const legacyErrorMiddlewareCallsNextWithErr = callsNextWithErr(legacyErrorMiddleware);

const legacyErrorMiddlewareCatchesErrWithResponse = catchesErrWithResponse(legacyErrorMiddleware);

describe('legacyErrorMiddleware', () => {
	// Necessary since the consolveOverride is called after the getter for the logger is launced
	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => ({}));
	});

	legacyErrorMiddlewareCallsNextWithErr('Error', new Error('This is an error'));

	legacyErrorMiddlewareCallsNextWithErr('BadRequest', new BadRequest('bad request'));

	legacyErrorMiddlewareCallsNextWithErr(
		'InternalServerError (http-error which extends Error)',
		new InternalServerError('internal error'),
	);

	legacyErrorMiddlewareCallsNextWithErr('nonsense object', {
		veryImportantMessage: 'NOT!',
	});

	legacyErrorMiddlewareCatchesErrWithResponse(
		// Because ITxLegacyError extends IBasicLegacyError, txErrorMiddleware
		// should be put before legacyErrorMiddleware
		'ITxLegacyError (extends IBasicLegacyError)',
		{
			data: 'tx could not be processed',
			cause: 'unknown',
			error: 'tx error',
		},
		500,
		new InternalServerError('tx error'),
	);

	legacyErrorMiddlewareCatchesErrWithResponse(
		'IBasicError',
		{
			error: 'basic error',
		},
		500,
		new InternalServerError('basic error'),
	);

	legacyErrorMiddlewareCatchesErrWithResponse(
		'ILegacyError',
		{
			error: 'Server refuses to brew coffee.',
			statusCode: 418,
		},
		418,
		HttpErrorConstructor(418, 'Server refuses to brew coffee.'),
	);

	callsNextWithSentHeaders(legacyErrorMiddleware, {
		error: 'Server refuses to brew coffee.',
		statusCode: 418,
	});
});
