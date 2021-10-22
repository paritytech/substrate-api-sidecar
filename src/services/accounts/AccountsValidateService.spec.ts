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
		// Reset the MockApi to be 0 - Polkadot
		(mockApi.registry.chainSS58 as unknown) = 0;
	});

	it('Should verify a polkadot address when connected to polkadot', () => {
		const expectedResponse = {
			isValid: true,
			networkId: 'polkadot',
			ss58: '0',
		};
		const polkadotAddr = '1xN1Q5eKQmS5AzASdjt6R6sHF76611vKR4PFpFjy1kXau4m';

		expect(
			sanitizeNumbers(validateService.validateAddress(polkadotAddr))
		).toStrictEqual(expectedResponse);
	});

	it('Should verify a kusama address when connected to kusama', () => {
		const expectedResponse = {
			isValid: true,
			networkId: 'kusama',
			ss58: '2',
		};
		const kusamaAddr = 'DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc';
		(mockApi.registry.chainSS58 as unknown) = 2;

		expect(
			sanitizeNumbers(validateService.validateAddress(kusamaAddr))
		).toStrictEqual(expectedResponse);
	});

	it('Should verify a kulupu address when connected to kulup', () => {
		const expectedResponse = {
			isValid: true,
			networkId: 'kulupu',
			ss58: '16',
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
			networkId: 'substrate',
			ss58: '42',
		};
		const substrateAddr = '5EnxxUmEbw8DkENKiYuZ1DwQuMoB2UWEQJZZXrTsxoz7SpgG';
		(mockApi.registry.chainSS58 as unknown) = 42;

		expect(
			sanitizeNumbers(validateService.validateAddress(substrateAddr))
		).toStrictEqual(expectedResponse);
	});
});
