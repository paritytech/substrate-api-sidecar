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

import { callsNextWithErr, callsNextWithSentHeaders, catchesErrWithResponse } from './testTools';
import { txErrorMiddleware } from './txErrorMiddleware';

const txErrorMiddlewareCallsNextWithErr = callsNextWithErr(txErrorMiddleware);

const txErrorMiddlewareCatchesErrWithResponse = catchesErrWithResponse(txErrorMiddleware);

describe('txErrorMiddleware', () => {
	// Necessary since the consolveOverride is called after the getter for the logger is launced
	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => ({}));
	});

	txErrorMiddlewareCallsNextWithErr('Error', new Error('This is an error'));

	txErrorMiddlewareCallsNextWithErr('BadRequest', new BadRequest('bad request'));

	txErrorMiddlewareCallsNextWithErr(
		'InternalServerError (http-error which extends Error)',
		new InternalServerError('internal error'),
	);

	txErrorMiddlewareCallsNextWithErr('nonsense object', {
		cat: 'in a hat',
	});

	txErrorMiddlewareCallsNextWithErr('ILegacyError', {
		error: 'legacy error',
		statusCode: 500,
	});

	txErrorMiddlewareCallsNextWithErr('IBasicError', {
		error: 'basic error',
	});

	txErrorMiddlewareCatchesErrWithResponse(
		'ITxLegacyError (with data)',
		{
			code: 500,
			data: 'some data!',
			cause: 'a cause!',
			error: 'an error!',
		},
		500,
		{
			code: 500,
			data: 'some data!',
			cause: 'a cause!',
			error: 'an error!',
		},
	);

	txErrorMiddlewareCatchesErrWithResponse(
		'ITxLegacyError (without data)',
		{
			code: 500,
			cause: 'a cause!',
			error: 'an error!',
		},
		500,
		{
			code: 500,
			cause: 'a cause!',
			error: 'an error!',
		},
	);

	callsNextWithSentHeaders(txErrorMiddleware, {
		data: 'some data!',
		cause: 'a cause!',
		error: 'an error!',
	});
});
