// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { IAccountCompare, IAddressDetails } from '../../types/responses/AccountCompare';
import { IValidateAddrResponse } from '../../types/responses/ValidateAddress';
import { AbstractService } from '../AbstractService';
import { AccountsValidateService } from './AccountsValidateService';

export class AccountsCompareService extends AbstractService {
	private accountsValidateService = new AccountsValidateService(this.specName);
	/**
	 * Compares up to 30 SS58 addresses and returns if they are equal or not,
	 * along with details of each address. Equality is determined by comparing
	 * the accountId/publicKey of each address.
	 *
	 * @param addresses up to 30 SS58 addresses
	 */
	public accountCompare(addresses: string[]): IAccountCompare {
		const addressDetailsArray: IValidateAddrResponse[] = [];
		for (let i = 0; i < addresses.length; i++) {
			addressDetailsArray.push(this.accountsValidateService.validateAddress(addresses[i]));
		}

		const areEqual = addressDetailsArray.every(
			(address) => address.accountId === (addressDetailsArray[0] as unknown as IValidateAddrResponse).accountId,
		);

		return {
			areEqual,
			addresses: addresses.map((address, index) => {
				const addressDetails = addressDetailsArray[index];
				return {
					ss58Format: address,
					ss58Prefix: addressDetails.ss58Prefix,
					network: addressDetails.network,
					publicKey: addressDetails.accountId,
				};
			}) as IAddressDetails[],
		};
	}
}
