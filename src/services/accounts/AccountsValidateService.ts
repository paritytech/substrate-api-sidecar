import { knownSubstrate } from '@polkadot/networks/substrate';
import { hexToU8a, isHex } from '@polkadot/util';
import { base58Decode, checkAddressChecksum } from '@polkadot/util-crypto';
import { defaults } from '@polkadot/util-crypto/address/defaults';

import { AbstractService } from '../AbstractService';

interface ValidateAddrResponse {
	isValid: boolean;
	networkId: string | null;
	ss58: number | null;
}

export class AccountsValidateService extends AbstractService {
	validateAddress(address: string): ValidateAddrResponse {
		let u8Address;
		if (isHex(address)) {
			u8Address = hexToU8a(address);
		} else {
			try {
				u8Address = base58Decode(address);
			} catch {
				return {
					isValid: false,
					networkId: null,
					ss58: null,
				};
			}
		}

		if (defaults.allowedEncodedLengths.includes(u8Address.length)) {
			const [isValid, , , ss58Decoded] = checkAddressChecksum(u8Address);
			const isValidNetworkId = this.api.registry.chainSS58 === ss58Decoded;
			const networkInfo = knownSubstrate.filter(
				(obj) => obj.prefix === ss58Decoded
			)[0];

			return {
				isValid: isValid && isValidNetworkId,
				networkId: networkInfo ? networkInfo.network : null,
				ss58: ss58Decoded,
			};
		}

		return {
			isValid: false,
			networkId: null,
			ss58: null,
		};
	}
}
