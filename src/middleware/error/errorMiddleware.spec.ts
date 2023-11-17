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

import { errorMiddleware } from './errorMiddleware';
import { callsNextWithErr, callsNextWithSentHeaders, catchesErrWithStatus } from './testTools';

const errorMiddlewareCallsNextWithErr = callsNextWithErr(errorMiddleware);

const errorMiddlewareCatchesErrWithStatus = catchesErrWithStatus(errorMiddleware);

describe('errorMiddleware', () => {
	// Necessary since the consolveOverride is called after the getter for the logger is launced
	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => ({}));
	});

	errorMiddlewareCallsNextWithErr('ILegacyError', {
		error: 'legacy error',
		statusCode: 500,
	});

	errorMiddlewareCallsNextWithErr('IBasicError', {
		error: 'basic error',
	});

	errorMiddlewareCallsNextWithErr('ITxLegacyError', {
		data: 'tx could not be processed',
		cause: 'unknown',
		error: 'tx error',
	});

	errorMiddlewareCallsNextWithErr('nonsense object', {
		veryImportantMessage: 'NOT',
	});

	errorMiddlewareCatchesErrWithStatus('Error', new Error('This is an error'), 500);

	errorMiddlewareCatchesErrWithStatus(
		'BadRequest (http-error which extends Error) (code gets changed to 500)',
		new BadRequest('bad request'),
		500,
	);

	errorMiddlewareCatchesErrWithStatus(
		'InternalServerError (http-error which extends Error)',
		new InternalServerError('internal error'),
		500,
	);

	callsNextWithSentHeaders(errorMiddleware, new Error('This is an error'));
});
