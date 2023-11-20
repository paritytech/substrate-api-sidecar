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
import { AccountsConvertService } from './AccountsConvertService';

const mockApi = {
	...defaultMockApi,
} as unknown as ApiPromise;
const validateService = new AccountsConvertService(mockApi);

describe('Convert accounts', () => {
	it('Should convert a Substrate AccountId to an SS58 Address when `scheme` equals `ecdsa`', () => {
		const expectedResponse = {
			ss58Prefix: '42',
			network: 'substrate',
			address: '5ED8KTwWENGLtVwKYYUz37uYmLNCwx94yNBqC3ebVM2R3Gd7',
			accountId: '0x5ee4c6cf929012503fa9367c4d3be6908fe3653b24d2ff0dece55c9fa22fa32a',
			scheme: 'ecdsa',
			publicKey: false,
		};
		const substrateAccountId = '0x5ee4c6cf929012503fa9367c4d3be6908fe3653b24d2ff0dece55c9fa22fa32a';

		expect(sanitizeNumbers(validateService.accountConvert(substrateAccountId, 'ecdsa', 42, false))).toStrictEqual(
			expectedResponse,
		);
	});

	it('Should convert a Kusama AccountId to an SS58 Address when `scheme` equals `sr25519`', () => {
		const expectedResponse = {
			ss58Prefix: '2',
			network: 'kusama',
			address: 'EMjXJCeH3BK7b1gjUmZTnv2jEtYP8v7yRptqyqzbq8WEA82',
			accountId: '0x4edf1602df21d94104ac13722700c751efc1a19bbadf8098b2a0b89f9ffae325',
			scheme: 'sr25519',
			publicKey: false,
		};
		const kusamaAcountId = '0x4edf1602df21d94104ac13722700c751efc1a19bbadf8098b2a0b89f9ffae325';

		expect(sanitizeNumbers(validateService.accountConvert(kusamaAcountId, 'sr25519', 2, false))).toStrictEqual(
			expectedResponse,
		);
	});

	it('Should convert an Acala AccountId to an SS58 Address when `scheme` equals `ed25519`', () => {
		const expectedResponse = {
			ss58Prefix: '10',
			network: 'acala',
			address: '22eP3hi3krLWmteYzoqac6fDQpmgCa9HDrxidbSQBzhLKK6H',
			accountId: '0x4e6411b0c78b280727736962636b4984d8e5f457e9cd283ab751c9fb77725461',
			scheme: 'ed25519',
			publicKey: false,
		};
		const acalaAccountId = '0x4e6411b0c78b280727736962636b4984d8e5f457e9cd283ab751c9fb77725461';

		expect(sanitizeNumbers(validateService.accountConvert(acalaAccountId, 'ed25519', 10, false))).toStrictEqual(
			expectedResponse,
		);
	});

	it('Should convert a valid Astar AccountId to an SS58 Address', () => {
		const expectedResponse = {
			ss58Prefix: '5',
			network: 'astar',
			address: 'Z1swJuLs8YfJxVe4r43qkGhsPQGt5wJcefcxuHzrj6xjY7u',
			accountId: '0x8832f0039ef4164834ccb0b454378a6d50f6979ddf7582a1cf911788a6cde537',
			scheme: 'sr25519',
			publicKey: false,
		};
		const astarAccountId = '0x8832f0039ef4164834ccb0b454378a6d50f6979ddf7582a1cf911788a6cde537';

		expect(sanitizeNumbers(validateService.accountConvert(astarAccountId, 'sr25519', 5, false))).toStrictEqual(
			expectedResponse,
		);
	});

	// Since the input parameter is a Public key (hex) (and not an AccountId),
	// if we set the publicKey=true the output is an SS58 Address.
	it('Should convert a valid Polkadot Public key (hex) to an SS58 Address when `publicKey` equals `true`', () => {
		const expectedResponse = {
			ss58Prefix: '0',
			network: 'polkadot',
			address: '1rsCBWhPgyDETNS9yxnANSnm3KAtkxm4mu9jjfMhDF6xaV8',
			accountId: '0x026e42c81603c7eaa2bdc40115306f05c94b563ff9e92120e8ea3480fec939e2e9',
			scheme: 'ecdsa',
			publicKey: true,
		};
		const polkadotPublicKey = '0x026e42c81603c7eaa2bdc40115306f05c94b563ff9e92120e8ea3480fec939e2e9';

		expect(sanitizeNumbers(validateService.accountConvert(polkadotPublicKey, 'ecdsa', 0, true))).toStrictEqual(
			expectedResponse,
		);
	});

	// Since the input parameter is a Public key (hex) (and not an AccountId), if we
	// set the publicKey=false, the output is the Public key (SS58) and not an SS58 Address.
	it('Should convert a valid Polkadot Public key (hex) to a Public key (SS58) when `publicKey` equals `false`', () => {
		const expectedResponse = {
			ss58Prefix: '0',
			network: 'polkadot',
			address: '1F4td7J8YwTLdiKaQL2cNbWsv5mTpYT1uuWgGh6Hv6snxgmz',
			accountId: '0x026e42c81603c7eaa2bdc40115306f05c94b563ff9e92120e8ea3480fec939e2e9',
			scheme: 'ecdsa',
			publicKey: false,
		};
		const polkadotPublicKey = '0x026e42c81603c7eaa2bdc40115306f05c94b563ff9e92120e8ea3480fec939e2e9';

		expect(sanitizeNumbers(validateService.accountConvert(polkadotPublicKey, 'ecdsa', 0, false))).toStrictEqual(
			expectedResponse,
		);
	});

	// This ensures the behaviour of the endpoint correctly converts a kusama publicKey given
	// the following input. See PR: https://github.com/paritytech/substrate-api-sidecar/pull/1280
	it('Should convert a valid Kusama publicKey when `publicKey` equals `true`', () => {
		const expectedResponse = {
			accountId: '0x96074594cccf1cd185fa8a72ceaeefd86648f8d45514f3ce33c31bdd07e4655d',
			address: 'Fy2rsYCoowQBtuFXqLE65ehAY9T6KWcGiNCQAyPDCkfpm4s',
			network: 'kusama',
			publicKey: true,
			scheme: 'sr25519',
			ss58Prefix: '2',
		};

		const kusamaPublicKey = '0x96074594cccf1cd185fa8a72ceaeefd86648f8d45514f3ce33c31bdd07e4655d';

		expect(sanitizeNumbers(validateService.accountConvert(kusamaPublicKey, 'sr25519', 2, true))).toStrictEqual(
			expectedResponse,
		);
	});

	// We try to convert a Polkadot AccountId to an SS58 Address by setting the publicKey=true
	// which is not correct and that is why in the response we have an invalid address.
	// If we would like to convert it correctly and have the expected SS58 address
	// then we should set the publicKey=false.
	it('Should convert a valid AccountId to an invalid address when `publicKey` equals `true`', () => {
		const expectedResponse = {
			ss58Prefix: '0',
			network: 'polkadot',
			address: '1rsCBWhPgyDETNS9yxnANSnm3KAtkxm4mu9jjfMhDF6xaV8',
			accountId: '0x2607fd20388303bd409e551202ee47b753b4382feac914e9f7ab0d4f728c2bf7',
			scheme: 'ecdsa',
			publicKey: true,
		};
		const polkadotAccountId = '0x2607fd20388303bd409e551202ee47b753b4382feac914e9f7ab0d4f728c2bf7';

		expect(sanitizeNumbers(validateService.accountConvert(polkadotAccountId, 'ecdsa', 0, true))).toStrictEqual(
			expectedResponse,
		);
	});

	it('Should correctly throw an error for an invalid AccountId', () => {
		const invalidAccountId = '0x8832f0039ef4164834ccb0b454378a6d0f6979ddf7582a1cf911788a6cde537';
		expect(() => sanitizeNumbers(validateService.accountConvert(invalidAccountId, 'sr25519', 42, true))).toThrow(
			'The `accountId` parameter provided is not a valid hex value.',
		);
	});

	it('Should correctly throw an error for an invalid prefix', () => {
		const invalidAccountId = '0x8832f0039ef4164834ccb0b454378a6d50f6979ddf7582a1cf911788a6cde537';
		expect(() =>
			sanitizeNumbers(validateService.accountConvert(invalidAccountId, 'sr25519', 10000000000, true)),
		).toThrow('The given `prefix` query parameter does not correspond to an existing network.');
	});
});
