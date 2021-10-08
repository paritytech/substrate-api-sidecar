/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiPromise } from '@polkadot/api';

import { polkadotRegistry } from '../../test-helpers/registries';
import {
	balancesTransferInvalid,
	balancesTransferValid,
	defaultMockApi,
	submitExtrinsic,
	tx,
} from '../test-helpers/mock';
import failParseResponse from '../test-helpers/responses/transaction/submitFailParse.json';
import nodeRejectResponse from '../test-helpers/responses/transaction/submitNodeReject.json';
import { TransactionSubmitService } from './TransactionSubmitService';

const mockApi = {
	...defaultMockApi,
} as unknown as ApiPromise;

const transactionSubmitService = new TransactionSubmitService(mockApi);

describe('TransactionSubmitService', () => {
	describe('submitTransaction', () => {
		it('works with a valid a transaction', async () => {
			return expect(
				transactionSubmitService.submitTransaction(balancesTransferValid)
			).resolves.toStrictEqual({
				hash: polkadotRegistry.createType('Hash'),
			});
		});

		it('throws with "Failed to parse a transaction" when tx is not parsable', async () => {
			const err = new Error(
				// eslint-disable-next-line no-useless-escape
				`createType(ExtrinsicV4):: Struct: failed on 'signature':: Struct: cannot decode type Type with value \"0x250284d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d01022f4deae1532ddd0\"`
			);
			err.stack =
				'Error: createType(ExtrinsicV4):: Struct: failed ... this is a unit test mock';

			(mockApi as any).tx = () => {
				throw err;
			};

			await expect(
				transactionSubmitService.submitTransaction(balancesTransferInvalid)
			).rejects.toStrictEqual(failParseResponse);

			(mockApi as any).tx = tx;
		});

		it('throws with "Failed to submit transaction" when the node rejects the transaction', async () => {
			const err = new Error('1012: Transaction is temporarily banned');
			err.stack =
				'Error: 1012: Transaction is temporarily banned ... this is a unit test mock';

			(mockApi.rpc.author as any).submitExtrinsic = () =>
				Promise.resolve().then(() => {
					throw err;
				});

			await expect(
				transactionSubmitService.submitTransaction(balancesTransferValid)
			).rejects.toStrictEqual(nodeRejectResponse);

			(mockApi.rpc.author as any).submitExtrinsic = submitExtrinsic;
		});
	});
});
