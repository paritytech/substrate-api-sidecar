import { ApiPromise } from '@polkadot/api';

import { sanitizeNumbers } from '../../sanitize';
import { AccountsValidateService } from './AccountsValidateService';
// import { polkadotRegistry } from '../../test-helpers/registries';

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
		// const polkadotAddrHex = polkadotRegistry.createType('AccountId', '1xN1Q5eKQmS5AzASdjt6R6sHF76611vKR4PFpFjy1kXau4m').toHex();;

		expect(
			sanitizeNumbers(validateService.validateAddress(polkadotAddr))
		).toStrictEqual(expectedResponse);
		// expect(sanitizeNumbers(validateService.validateAddress(polkadotAddrHex))).toStrictEqual(expectedResponse);
	});
});
