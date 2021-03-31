import HttpErrorConstructor from 'http-errors';
import { BadRequest, InternalServerError } from 'http-errors';

import { httpErrorMiddleware } from './httpErrorMiddleware';
import {
	callsNextWithErr,
	callsNextWithSentHeaders,
	catchesErrWithStatus,
} from './testTools';

const httpErrorMiddlewareCallsNextWithErr = callsNextWithErr(
	httpErrorMiddleware
);

const httpErrorMiddlewareCatchesErrWithStatus = catchesErrWithStatus(
	httpErrorMiddleware
);

describe('httpErrorMiddleware', () => {
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

	httpErrorMiddlewareCatchesErrWithStatus(
		'HttpErrorConstructor 404',
		HttpErrorConstructor(404, 'http error!'),
		404
	);

	httpErrorMiddlewareCatchesErrWithStatus(
		'BadRequest',
		new BadRequest('bad request'),
		400
	);

	httpErrorMiddlewareCatchesErrWithStatus(
		'InternalServerError',
		new InternalServerError('internal error'),
		500
	);

	callsNextWithSentHeaders(
		httpErrorMiddleware,
		new InternalServerError('internal error')
	);
});
