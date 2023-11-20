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

import { Keyring } from '@polkadot/api';
import { isHex } from '@polkadot/util';
import { hexToU8a } from '@polkadot/util';
import { allNetworks, blake2AsHex } from '@polkadot/util-crypto';
import { BadRequest } from 'http-errors';

import { IAccountConvert } from '../../types/responses/AccountConvert';
import { AbstractService } from '../AbstractService';

/**
 * Copyright 2023 via polkadot-js/common
 *
 * The slightly modified below logic is copyrighted from polkadot-js/common . The exact path to the code can be seen here:
 * https://github.com/polkadot-js/common/blob/e5cb0ba2b4a6b5817626cc964b4f66334f2410e4/packages/keyring/src/pair/index.ts#L44-L49
 */
const TYPE_ADDRESS = {
	ecdsa: (p: string) => (hexToU8a(p).length > 32 ? blake2AsHex(p) : p),
	ed25519: (p: string) => p,
	sr25519: (p: string) => p,
};

export class AccountsConvertService extends AbstractService {
	/**
	 * Takes a given AccountId or Public Key (hex) and converts it to an SS58 address.
	 * The conversion is based on the values of the variables scheme, ss58Prefix & publicKey.
	 * It also returns the network name.
	 *
	 * @param accountId or Public Key (hex)
	 * @param scheme
	 * @param ss58Prefix
	 * @param publicKey
	 */
	public accountConvert(
		accountId: string,
		scheme: 'ed25519' | 'sr25519' | 'ecdsa',
		ss58Prefix: number,
		publicKey: boolean,
	): IAccountConvert {
		const accountIdIsHex = isHex(accountId);
		if (!accountIdIsHex) {
			throw new BadRequest('The `accountId` parameter provided is not a valid hex value.');
		}
		let network = null;
		for (const networkParams of allNetworks) {
			if (networkParams['prefix'] === ss58Prefix) {
				network = networkParams['network'];
				break;
			}
		}
		if (network === null) {
			throw new BadRequest('The given `prefix` query parameter does not correspond to an existing network.');
		}

		const accountId2Encode = publicKey ? TYPE_ADDRESS[scheme](accountId) : accountId;

		const keyring = new Keyring({ type: scheme, ss58Format: ss58Prefix });
		const address = keyring.encodeAddress(accountId2Encode, ss58Prefix);

		return {
			ss58Prefix,
			network,
			address,
			accountId,
			scheme,
			publicKey,
		};
	}
}
