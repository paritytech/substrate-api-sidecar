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
import { validateAddressMiddleware } from './validateAddressMiddleware';

describe('validateAddressMiddleware', () => {
	doesNotErrorWith(
		'no address in params',
		{
			params: {
				number: '1',
			},
		} as unknown as Request,
		validateAddressMiddleware,
	);

	doesNotErrorWith(
		'a valid substrate address',
		{
			params: {
				number: '1',
				address: '5EnxxUmEbw8DkENKiYuZ1DwQuMoB2UWEQJZZXrTsxoz7SpgG',
			},
		} as unknown as Request,
		validateAddressMiddleware,
	);

	doesNotErrorWith(
		'a valid kusama address',
		{
			params: {
				number: '1',
				address: 'DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc',
			},
		} as unknown as Request,
		validateAddressMiddleware,
	);

	doesNotErrorWith(
		'a valid kulupu address',
		{
			params: {
				number: '1',
				address: '2cYv9Gk6U4m4a7Taw9pG8qMfd1Pnxw6FLTvV6kYZNhGL6M9y',
			},
		} as unknown as Request,
		validateAddressMiddleware,
	);

	doesNotErrorWith(
		'a valid edgeware address',
		{
			params: {
				number: '1',
				address: '5D24s4paTdVxddyeUzgsxGGiRd7SPhTnEvKu6XGPQvj1QSYN',
			},
		} as unknown as Request,
		validateAddressMiddleware,
	);

	doesNotErrorWith(
		'a valid polkadot address',
		{
			params: {
				number: '1',
				address: '1xN1Q5eKQmS5AzASdjt6R6sHF76611vKR4PFpFjy1kXau4m',
			},
		} as unknown as Request,
		validateAddressMiddleware,
	);

	doesNotErrorWith(
		'a valid H160 address',
		{
			params: {
				number: '1',
				address: '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac',
			},
		} as unknown as Request,
		validateAddressMiddleware,
	);

	errorsWith(
		'an address containing an invalid base58 char',
		{
			params: {
				number: '1',
				address: '5EnxIUmEbw8DkENKiYuZ1DwQuMoB2UWEQJZZXrTsxoz7SpgG',
			},
		} as unknown as Request,
		new BadRequest('Invalid base58 character "I" (0x49) at index 4'),
		validateAddressMiddleware,
	);

	errorsWith(
		'an address missing some bytes',
		{
			params: {
				number: '1',
				address: 'y9EMHt34JJo4rWLSaxoLGdYXvjgSXEd4zHUnQgfNzwES8b',
			},
		} as unknown as Request,
		new BadRequest('Invalid address format'),
		validateAddressMiddleware,
	);

	errorsWith(
		'an address with invalid decoded address checksum',
		{
			params: {
				number: '1',
				address: '5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDwU',
			},
		} as unknown as Request,
		new BadRequest('Invalid decoded address checksum'),
		validateAddressMiddleware,
	);

	errorsWith(
		'a nonsense address',
		{
			params: {
				number: '1',
				address: 'hello',
			},
		} as unknown as Request,
		new BadRequest('Invalid base58 character "l" (0x6c) at index 2'),
		validateAddressMiddleware,
	);
});
