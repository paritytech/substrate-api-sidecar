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

import { Request } from 'express';
import { BadRequest } from 'http-errors';

import { doesNotErrorWith, errorsWith } from './util';
import { validateBooleanMiddleware } from './validateBooleanMiddleware';

describe('validateBooleanMiddleware', () => {
	doesNotErrorWith(
		'no query params in path',
		{
			query: {},
		} as unknown as Request,
		validateBooleanMiddleware([]),
	);

	doesNotErrorWith(
		'valid true and false query params',
		{
			query: {
				finalized: 'true',
				eventDocs: 'false',
			},
		} as unknown as Request,
		validateBooleanMiddleware(['finalized', 'eventDocs']),
	);

	doesNotErrorWith(
		'Non specified invalid query params',
		{
			query: {
				invalid: 'truee',
			},
		} as unknown as Request,
		validateBooleanMiddleware([]),
	);

	errorsWith(
		'an invalid true query param',
		{
			query: {
				finalized: 'truee',
			},
		} as unknown as Request,
		new BadRequest('Query parameter: finalized has an invalid boolean value of truee'),
		validateBooleanMiddleware(['finalized']),
	);

	errorsWith(
		'an invalid false query param',
		{
			query: {
				finalized: 'falsee',
			},
		} as unknown as Request,
		new BadRequest('Query parameter: finalized has an invalid boolean value of falsee'),
		validateBooleanMiddleware(['finalized']),
	);

	errorsWith(
		'multiple invalid query params',
		{
			query: {
				finalized: 'notTrue',
				eventDocs: 'notFalse',
			},
		} as unknown as Request,
		new BadRequest(
			'Query parameter: finalized has an invalid boolean value of notTrue - Query parameter: eventDocs has an invalid boolean value of notFalse',
		),
		validateBooleanMiddleware(['finalized', 'eventDocs']),
	);
});
