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

import { sanitizeNumbers } from '../../sanitize';
import { defaultMockApi } from '../test-helpers/mock';
import { AccountsValidateService } from './AccountsValidateService';

const mockApi = {
	...defaultMockApi,
} as unknown as ApiPromise;
const validateService = new AccountsValidateService(mockApi);

describe('Validate addresses', () => {
	it('Should verify a polkadot address', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '0',
			network: 'polkadot',
			accountId: '0x2a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc59',
		};
		const polkadotAddr = '1xN1Q5eKQmS5AzASdjt6R6sHF76611vKR4PFpFjy1kXau4m';

		expect(sanitizeNumbers(validateService.validateAddress(polkadotAddr))).toStrictEqual(expectedResponse);
	});

	it('Should verify a kusama address', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '2',
			network: 'kusama',
			accountId: '0x2a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc59',
		};
		const kusamaAddr = 'DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc';

		expect(sanitizeNumbers(validateService.validateAddress(kusamaAddr))).toStrictEqual(expectedResponse);
	});

	it('Should verify a kulupu address', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '16',
			network: 'kulupu',
			accountId: '0x2a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc59',
		};
		const kulupuAddr = '2cYv9Gk6U4m4a7Taw9pG8qMfd1Pnxw6FLTvV6kYZNhGL6M9y';

		expect(sanitizeNumbers(validateService.validateAddress(kulupuAddr))).toStrictEqual(expectedResponse);
	});

	it('Should verify a valid default substrate address', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '42',
			network: 'substrate',
			accountId: '0x78b39b0b6dd87cb68009eb570511d21c229bdb5e94129ae570e9b79442ba2665',
		};
		const substrateAddr = '5EnxxUmEbw8DkENKiYuZ1DwQuMoB2UWEQJZZXrTsxoz7SpgG';

		expect(sanitizeNumbers(validateService.validateAddress(substrateAddr))).toStrictEqual(expectedResponse);
	});

	it('Should give the correct response for a polkadot hex value', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '0',
			network: 'polkadot',
			accountId: '0x2a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc59',
		};
		const polkadotHex = '0x002a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc592312';

		expect(sanitizeNumbers(validateService.validateAddress(polkadotHex))).toStrictEqual(expectedResponse);
	});

	it('Should give the correct response for a kusama hex value', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '2',
			network: 'kusama',
			accountId: '0xce046d43fc4c0fb8b3b754028515e5020f5f1d8d620b4ef0f983c5df34b19529',
		};
		const kusamaHex = '0x02ce046d43fc4c0fb8b3b754028515e5020f5f1d8d620b4ef0f983c5df34b1952909e9';

		expect(sanitizeNumbers(validateService.validateAddress(kusamaHex))).toStrictEqual(expectedResponse);
	});

	it('Should give the correct response for a karura hex value', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '8',
			network: 'karura',
			accountId: '0x6d6f646c6163612f636470740000000000000000000000000000000000000000',
		};
		const karuraHex = '0x086d6f646c6163612f6364707400000000000000000000000000000000000000008333';

		expect(sanitizeNumbers(validateService.validateAddress(karuraHex))).toStrictEqual(expectedResponse);
	});

	it('Should return the correct response for an invalid hex value', () => {
		const expectedResponse = {
			isValid: false,
			ss58Prefix: null,
			network: null,
			accountId: null,
		};
		const invalidAddr = '0x2a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc59';

		expect(sanitizeNumbers(validateService.validateAddress(invalidAddr))).toStrictEqual(expectedResponse);
	});

	it('Should correctly throw an error for an invalid ss58 address', () => {
		const invalidAddr = '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX0';
		expect(() => sanitizeNumbers(validateService.validateAddress(invalidAddr))).toThrow(
			'Error: Invalid base58 character "0" (0x30) at index 48',
		);
	});
});
