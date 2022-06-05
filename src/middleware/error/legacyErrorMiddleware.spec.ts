import { BadRequest, InternalServerError } from 'http-errors';
import HttpErrorConstructor from 'http-errors';

import { legacyErrorMiddleware } from './legacyErrorMiddleware';
import {
	callsNextWithErr,
	callsNextWithSentHeaders,
	catchesErrWithResponse,
} from './testTools';

const legacyErrorMiddlewareCallsNextWithErr = callsNextWithErr(
	legacyErrorMiddleware
);

const legacyErrorMiddlewareCatchesErrWithResponse = catchesErrWithResponse(
	legacyErrorMiddleware
);

describe('legacyErrorMiddleware', () => {
	// Necessary since the consolveOverride is called after the getter for the logger is launced
	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => ({}));
	});

	legacyErrorMiddlewareCallsNextWithErr('Error', new Error('This is an error'));

	legacyErrorMiddlewareCallsNextWithErr(
		'BadRequest',
		new BadRequest('bad request')
	);

	legacyErrorMiddlewareCallsNextWithErr(
		'InternalServerError (http-error which extends Error)',
		new InternalServerError('internal error')
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
		new InternalServerError('tx error')
	);

	legacyErrorMiddlewareCatchesErrWithResponse(
		'IBasicError',
		{
			error: 'basic error',
		},
		500,
		new InternalServerError('basic error')
	);

	legacyErrorMiddlewareCatchesErrWithResponse(
		'ILegacyError',
		{
			error: 'Server refuses to brew coffee.',
			statusCode: 418,
		},
		418,
		HttpErrorConstructor(418, 'Server refuses to brew coffee.')
	);

	callsNextWithSentHeaders(legacyErrorMiddleware, {
		error: 'Server refuses to brew coffee.',
		statusCode: 418,
	});
});
