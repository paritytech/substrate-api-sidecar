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

import HttpErrorConstructor from 'http-errors';
import { BadRequest, InternalServerError } from 'http-errors';

import { httpErrorMiddleware } from './httpErrorMiddleware';
import { callsNextWithErr, callsNextWithSentHeaders, catchesErrWithStatus } from './testTools';

const httpErrorMiddlewareCallsNextWithErr = callsNextWithErr(httpErrorMiddleware);

const httpErrorMiddlewareCatchesErrWithStatus = catchesErrWithStatus(httpErrorMiddleware);

describe('httpErrorMiddleware', () => {
	// Necessary since the consolveOverride is called after the getter for the logger is launced
	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => ({}));
	});

	httpErrorMiddlewareCallsNextWithErr('Error', new Error('This is an error'));

	httpErrorMiddlewareCallsNextWithErr('IBasicError', {
		error: 'basic error',
	});

	httpErrorMiddlewareCallsNextWithErr('ILegacyError', {
		error: 'legacy error',
		statusCode: 500,
	});

	httpErrorMiddlewareCallsNextWithErr('ITxLegacyError', {
		data: 'tx could not be processed',
		cause: 'unknown',
		error: 'tx error',
	});

	httpErrorMiddlewareCallsNextWithErr('nonsense object', {
		veryImportantMessage: 'NOT',
	});

	httpErrorMiddlewareCatchesErrWithStatus('HttpErrorConstructor 404', HttpErrorConstructor(404, 'http error!'), 404);

	httpErrorMiddlewareCatchesErrWithStatus('BadRequest', new BadRequest('bad request'), 400);

	httpErrorMiddlewareCatchesErrWithStatus('InternalServerError', new InternalServerError('internal error'), 500);

	callsNextWithSentHeaders(httpErrorMiddleware, new InternalServerError('internal error'));
});
