import { BadRequest, InternalServerError } from 'http-errors';
import * as HttpErrorConstructor from 'http-errors';

import { internalErrorMiddleware } from './internalErrorMiddleware';
import { callsNextWithSentHeaders, catchesErrWithResponse } from './testTools';

const internalErrorMiddlewareCatchesErrWithResponse = catchesErrWithResponse(
	internalErrorMiddleware
);

describe('internalErrorMiddleware', () => {
	internalErrorMiddlewareCatchesErrWithResponse(
		'ITxLegacyError',
		{
			data: 'tx could not be processed',
			cause: 'unknown',
			error: 'tx error',
		},
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'IBasicError',
		{
			error: 'basic error',
		},
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'ILegacyError',
		{
			error: 'Server refuses to brew coffee.',
			statusCode: 418,
		},
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'Error',
		new Error('This is an error'),
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'BadRequest',
		new BadRequest('bad request'),
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'InternalServerError',
		new InternalServerError('internal error'),
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'HttpErrorConstructor 404',
		HttpErrorConstructor(404, 'http error!'),
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'string',
		'hello',
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'null',
		null,
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'undefined',
		undefined,
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'-1',
		-1,
		500,
		new InternalServerError('Internal Error')
	);

	internalErrorMiddlewareCatchesErrWithResponse(
		'random object',
		{ brawndo: 'got what plants crave' },
		500,
		new InternalServerError('Internal Error')
	);

	callsNextWithSentHeaders(internalErrorMiddleware, [
		{ err: 'its got electrolyte' },
	]);
});
