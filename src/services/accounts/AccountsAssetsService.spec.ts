import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import { AccountsAssetsService } from './AccountsAssetsService';

const accountsAssetsService = new AccountsAssetsService(mockApi);

describe('AccountsAssetsService', () => {
	const at = {
		hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
		height: '789629',
	};

	describe('AccountsAssetsService.fetchAssetBalances', () => {
		it('Should return the correct response with the assets param', async () => {
			const expectedResponse = {
				at,
                assets: [
                    { balance: '10000000', isFrozen: false, isSufficient: true },
                    { balance: '20000000', isFrozen: true, isSufficient: true }
                ]
			};

			const response = await accountsAssetsService.fetchAssetBalances(
				blockHash789629,
				'0xffff',
				[10, 20]
			);

			expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
		});

		it('Should return the correct response without the assets param', async () => {
            const expectedResponse = {
                at,
                assets: [
                    { balance: '10000000', isFrozen: false, isSufficient: true },
                    { balance: '20000000', isFrozen: true, isSufficient: true },
                    { balance: '20000000', isFrozen: false, isSufficient: false },
                    { balance: '20000000', isFrozen: false, isSufficient: false },
                    { balance: '20000000', isFrozen: false, isSufficient: false }
                ]
            };

            const response = await accountsAssetsService.fetchAssetBalances(
                blockHash789629,
                '0xffff',
                []
            );

            console.log(sanitizeNumbers(response));

            expect(sanitizeNumbers(response)).toMatchObject(expectedResponse);
        });
	});

	describe('AccountsAssetsService.fetchAssetApproval', () => {});
});
