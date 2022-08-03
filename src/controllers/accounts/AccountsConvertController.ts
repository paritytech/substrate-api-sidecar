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

import { ApiPromise } from '@polkadot/api';
import { KeypairType } from '@polkadot/util-crypto/types';
import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

import { AccountsConvertService } from '../../services/accounts';
import AbstractController from '../AbstractController';

export default class AccountsConvertController extends AbstractController<AccountsConvertService> {
	constructor(api: ApiPromise) {
		super(api, '/accounts/:address/convert', new AccountsConvertService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.accountConvert]]);
	}

	private accountConvert: RequestHandler = (
		{ params: { address }, query: { scheme, prefix, publicKey } },
		res
	) => {
		// Validation of the `scheme` query param
		const cryptoScheme = (
			typeof scheme !== 'string' ? 'sr25519' : scheme
		) as KeypairType;
		if (
			!(
				cryptoScheme === 'ed25519' ||
				cryptoScheme === 'sr25519' ||
				cryptoScheme === 'ecdsa'
			)
		) {
			throw new BadRequest(
				'`scheme` can have one of those 3 values [ed25519, sr25519, ecdsa]'
			);
		}

		// Validation of the `prefix` query param
		const networkPrefix = typeof prefix !== 'string' ? '42' : prefix;
		const ss58Prefix = this.parseNumberOrThrow(
			networkPrefix,
			'`prefix` provided is not a number.'
		);

		// Validation of the `publicKey` query param
		if (
			!(
				String(publicKey).toLowerCase() === 'true' ||
				String(publicKey).toLowerCase() === 'false' ||
				publicKey === undefined
			)
		) {
			throw new BadRequest(
				'`publicKey` can be either true or false (boolean value)'
			);
		}
		const pubKey = typeof publicKey !== 'string' ? true : publicKey === 'true';

		AccountsConvertController.sanitizedSend(
			res,
			this.service.accountConvert(address, cryptoScheme, ss58Prefix, pubKey)
		);
	};
}
