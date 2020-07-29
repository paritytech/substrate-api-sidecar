import { BadRequest, InternalServerError } from 'http-errors';

import {
	callsNextWithErr,
	callsNextWithSentHeaders,
	catchesErrWithResponse,
} from './testTools';
import { txErrorMiddleware } from './txErrorMiddleware';

const txErrorMiddlewareCallsNextWithErr = callsNextWithErr(txErrorMiddleware);

const txErrorMiddlewareCatchesErrWithResponse = catchesErrWithResponse(
	txErrorMiddleware
);

describe('txErrorMiddleware', () => {
	txErrorMiddlewareCallsNextWithErr('Error', new Error('This is an error'));

	txErrorMiddlewareCallsNextWithErr(
		'BadRequest',
		new BadRequest('bad request')
	);

	txErrorMiddlewareCallsNextWithErr(
		'InternalServerError (http-error which extends Error)',
		new InternalServerError('internal error')
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
		}
	);

	txErrorMiddlewareCatchesErrWithResponse(
		'ITxLegacyError (without data)',
		{
			cause: 'a cause!',
			error: 'an error!',
		},
		500,
		{
			code: 500,
			cause: 'a cause!',
			error: 'an error!',
		}
	);

	callsNextWithSentHeaders(txErrorMiddleware, {
		data: 'some data!',
		cause: 'a cause!',
		error: 'an error!',
	});
});
