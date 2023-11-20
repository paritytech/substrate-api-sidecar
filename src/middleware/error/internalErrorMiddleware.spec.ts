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

import { internalErrorMiddleware } from './internalErrorMiddleware';
import { callsNextWithSentHeaders, catchesErrWithResponse } from './testTools';

const internalErrorMiddlewareCatchesErrWithResponse = catchesErrWithResponse(internalErrorMiddleware);

describe('internalErrorMiddleware', () => {
	// Necessary since the consolveOverride is called after the getter for the logger is launced
	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => ({}));
	});

	internalErrorMiddlewareCatchesErrWithResponse(
		'ITxLegacyError',
		{
			data: 'tx could not be processed',
			cause: 'unknown',
			error: 'tx error',
		},
		500,
		new InternalServerError('Internal Error'),
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'IBasicError',
		{
			error: 'basic error',
		},
		500,
		new InternalServerError('Internal Error'),
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'ILegacyError',
		{
			error: 'Server refuses to brew coffee.',
			statusCode: 418,
		},
		500,
		new InternalServerError('Internal Error'),
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'Error',
		new Error('This is an error'),
		500,
		new InternalServerError('Internal Error'),
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'BadRequest',
		new BadRequest('bad request'),
		500,
		new InternalServerError('Internal Error'),
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'InternalServerError',
		new InternalServerError('internal error'),
		500,
		new InternalServerError('Internal Error'),
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'HttpErrorConstructor 404',
		HttpErrorConstructor(404, 'http error!'),
		500,
		new InternalServerError('Internal Error'),
	);

	internalErrorMiddlewareCatchesErrWithResponse('string', 'hello', 500, new InternalServerError('Internal Error'));

	internalErrorMiddlewareCatchesErrWithResponse('null', null, 500, new InternalServerError('Internal Error'));

	internalErrorMiddlewareCatchesErrWithResponse('undefined', undefined, 500, new InternalServerError('Internal Error'));

	internalErrorMiddlewareCatchesErrWithResponse('-1', -1, 500, new InternalServerError('Internal Error'));

	internalErrorMiddlewareCatchesErrWithResponse(
		'random object',
		{ brawndo: 'got what plants crave' },
		500,
		new InternalServerError('Internal Error'),
	);

	callsNextWithSentHeaders(internalErrorMiddleware, [{ err: 'its got electrolyte' }]);
});
