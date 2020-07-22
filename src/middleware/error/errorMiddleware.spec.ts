import { BadRequest, InternalServerError } from 'http-errors';

import { errorMiddleware } from './errorMiddleware';
import {
	callsNextWithErr,
	callsNextWithSentHeaders,
	catchesErrWithStatus,
} from './testTools';

const errorMiddlewareCallsNextWithErr = callsNextWithErr(errorMiddleware);

const errorMiddlewareCatchesErrWithStatus = catchesErrWithStatus(
	errorMiddleware
);

describe('errorMiddleware', () => {
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

	errorMiddlewareCatchesErrWithStatus(
		'Error',
		new Error('This is an error'),
		500
	);

	errorMiddlewareCatchesErrWithStatus(
		'BadRequest (http-error which extends Error) (code gets changed to 500)',
		new BadRequest('bad request'),
		500
	);

	errorMiddlewareCatchesErrWithStatus(
		'InternalServerError (http-error which extends Error)',
		new InternalServerError('internal error'),
		500
	);

	callsNextWithSentHeaders(errorMiddleware, new Error('This is an error'));
});
