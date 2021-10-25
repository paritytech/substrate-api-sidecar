import { hexToU8a, isHex } from '@polkadot/util';
import { base58Decode, checkAddressChecksum } from '@polkadot/util-crypto';
import { defaults } from '@polkadot/util-crypto/address/defaults';

import { IValidateAddrResponse } from '../../types/responses/ValidateAddress';
import { AbstractService } from '../AbstractService';

export class AccountsValidateService extends AbstractService {
	validateAddress(address: string): IValidateAddrResponse {
		let u8Address;
		if (isHex(address)) {
			u8Address = hexToU8a(address);
		} else {
			try {
				u8Address = base58Decode(address);
			} catch {
				return {
					isValid: false,
					ss58Prefix: null,
				};
			}
		}

		if (defaults.allowedEncodedLengths.includes(u8Address.length)) {
			const [isValid, , , ss58Decoded] = checkAddressChecksum(u8Address);

			return {
				isValid: isValid,
				ss58Prefix: ss58Decoded,
			};
		}

		return {
			isValid: false,
			ss58Prefix: null,
		};
	}
}
