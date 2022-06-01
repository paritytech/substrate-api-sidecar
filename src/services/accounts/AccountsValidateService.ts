import { hexToU8a, isHex } from '@polkadot/util';
import {
	allNetworks,
	base58Decode,
	checkAddressChecksum,
} from '@polkadot/util-crypto';
import { defaults } from '@polkadot/util-crypto/address/defaults';

import { IValidateAddrResponse } from '../../types/responses/ValidateAddress';
import { AbstractService } from '../AbstractService';

export class AccountsValidateService extends AbstractService {
	/**
	 * Takes a given address and determines whether it is a ss58 formatted address,
	 * what the ss58 prefix for that address is,
	 * what is the network address format,
	 * and what the account ID is for this address.
	 *
	 * @param address ss58 or hex address to validate
	 */
	validateAddress(address: string): IValidateAddrResponse {
		let u8Address;
		let network;
		let accountId;
		if (isHex(address)) {
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
			network = null;
			for (const networkParams of allNetworks) {
				if (networkParams['prefix'] === ss58Prefix) {
					network = networkParams['network'];
					break;
				}
			}
			if (isHex(address)) {
				accountId = address;
			} else {
				accountId = this.api.registry.createType('AccountId', address).toHex();
			}
			return {
				isValid: isValid,
				ss58Prefix,
				network,
				accountId,
			};
		}

		return {
			isValid: false,
			ss58Prefix: null,
			network: null,
			accountId: null,
		};
	}
}
