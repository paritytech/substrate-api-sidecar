import { ApiPromise } from '@polkadot/api';

import { sanitizeNumbers } from '../../sanitize';
import { AccountsValidateService } from './AccountsValidateService';

describe('Validate addresses', () => {
	const mockApi = {
		registry: {
			chainSS58: 0,
		},
	} as unknown as ApiPromise;
	const validateService = new AccountsValidateService(mockApi);

	afterEach(() => {
		// Reset the `mockApi.registry.chainSS58` to be 0  before each test
		(mockApi.registry.chainSS58 as unknown) = 0;
	});

	it('Should verify a polkadot address when connected to polkadot', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '0',
		};
		const polkadotAddr = '1xN1Q5eKQmS5AzASdjt6R6sHF76611vKR4PFpFjy1kXau4m';

		expect(
			sanitizeNumbers(validateService.validateAddress(polkadotAddr))
		).toStrictEqual(expectedResponse);
	});

	it('Should verify a kusama address when connected to kusama', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '2',
		};
		const kusamaAddr = 'DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc';
		(mockApi.registry.chainSS58 as unknown) = 2;

		expect(
			sanitizeNumbers(validateService.validateAddress(kusamaAddr))
		).toStrictEqual(expectedResponse);
	});

	it('Should verify a kulupu address when connected to kulupu', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '16',
		};
		const kulupuAddr = '2cYv9Gk6U4m4a7Taw9pG8qMfd1Pnxw6FLTvV6kYZNhGL6M9y';
		(mockApi.registry.chainSS58 as unknown) = 16;

		expect(
			sanitizeNumbers(validateService.validateAddress(kulupuAddr))
		).toStrictEqual(expectedResponse);
	});

	it('Should verify a valid default substrate address', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '42',
		};
		const substrateAddr = '5EnxxUmEbw8DkENKiYuZ1DwQuMoB2UWEQJZZXrTsxoz7SpgG';
		(mockApi.registry.chainSS58 as unknown) = 42;

		expect(
			sanitizeNumbers(validateService.validateAddress(substrateAddr))
		).toStrictEqual(expectedResponse);
	});

	it('Should correctly validate a polkadot address on kusama', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '0',
		};
		const polkadotAddr = '1xN1Q5eKQmS5AzASdjt6R6sHF76611vKR4PFpFjy1kXau4m';
		(mockApi.registry.chainSS58 as unknown) = 2;

		expect(
			sanitizeNumbers(validateService.validateAddress(polkadotAddr))
		).toStrictEqual(expectedResponse);
	});

	it('Should give the correct response for a polkadot hex value', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '0',
		};
		const polkadotHex =
			'0x002a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc592312';

		expect(
			sanitizeNumbers(validateService.validateAddress(polkadotHex))
		).toStrictEqual(expectedResponse);
	});

	it('Should give the correct response for a kusama hex value', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '2',
		};
		const kusamaHex =
			'0x02ce046d43fc4c0fb8b3b754028515e5020f5f1d8d620b4ef0f983c5df34b1952909e9';
		(mockApi.registry.chainSS58 as unknown) = 2;

		expect(
			sanitizeNumbers(validateService.validateAddress(kusamaHex))
		).toStrictEqual(expectedResponse);
	});

	it('Should give the correct response for a karura hex value', () => {
		const expectedResponse = {
			isValid: true,
			ss58Prefix: '8',
		};
		const karuraHex =
			'0x086d6f646c6163612f6364707400000000000000000000000000000000000000008333';
		(mockApi.registry.chainSS58 as unknown) = 8;

		expect(
			sanitizeNumbers(validateService.validateAddress(karuraHex))
		).toStrictEqual(expectedResponse);
	});

	it('Should return the correct response for an invalid hex value', () => {
		const expectedResponse = {
			isValid: false,
			ss58Prefix: null,
		};
		const invalidAddr =
			'0x2a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc59';

		expect(
			sanitizeNumbers(validateService.validateAddress(invalidAddr))
		).toStrictEqual(expectedResponse);
	});
});
