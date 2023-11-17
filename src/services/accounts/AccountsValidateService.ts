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

import { hexToU8a, isHex } from '@polkadot/util';
import { allNetworks, base58Decode, checkAddressChecksum } from '@polkadot/util-crypto';
import { defaults } from '@polkadot/util-crypto/address/defaults';

import { IValidateAddrResponse } from '../../types/responses/ValidateAddress';
import { AbstractService } from '../AbstractService';

export class AccountsValidateService extends AbstractService {
	/**
	 * Takes a given address and determines whether it is a ss58 or
	 * a hex (from a u8 array) formatted address,
	 * what the ss58 prefix for that address is,
	 * what is the network address format,
	 * and what the account ID is for this address.
	 *
	 * @param address ss58 or hex address to validate
	 */
	validateAddress(address: string): IValidateAddrResponse {
		let u8Address;
		const addressIsHex = isHex(address);
		if (addressIsHex) {
			u8Address = hexToU8a(address);
		} else {
			try {
				u8Address = base58Decode(address);
			} catch (e) {
				throw new Error(e as string);
			}
		}

		if (defaults.allowedEncodedLengths.includes(u8Address.length)) {
			const [isValid, , , ss58Prefix] = checkAddressChecksum(u8Address);
			if (isValid) {
				let network = null;
				for (const networkParams of allNetworks) {
					if (networkParams['prefix'] === ss58Prefix) {
						network = networkParams['network'];
						break;
					}
				}
				const accountId = addressIsHex
					? '0x' + address.slice(4, -4)
					: this.api.registry.createType('AccountId', address).toHex();
				return {
					isValid: isValid,
					ss58Prefix,
					network,
					accountId,
				};
			}
		}

		return {
			isValid: false,
			ss58Prefix: null,
			network: null,
			accountId: null,
		};
	}
}
