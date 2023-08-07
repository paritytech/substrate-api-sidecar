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

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiPromise } from '@polkadot/api';
import { BadRequest } from 'http-errors';

import { polkadotRegistry } from '../../test-helpers/registries';
import {
	balancesTransferInvalid,
	balancesTransferValid,
	defaultMockApi,
	submitExtrinsic,
	tx,
} from '../test-helpers/mock';
import { TransactionSubmitService } from './TransactionSubmitService';

const mockApi = {
	...defaultMockApi,
	tx: tx,
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
			(mockApi as any).tx = () => {
				throw new BadRequest('Failed to parse transaction.');
			};

			await expect(
				transactionSubmitService.submitTransaction(balancesTransferInvalid)
			).rejects.toStrictEqual(new BadRequest('Failed to parse transaction.'));

			(mockApi as any).tx = tx;
		});

		it('throws with "Failed to submit transaction" when the node rejects the transaction', async () => {
			(mockApi.rpc.author as any).submitExtrinsic = () =>
				Promise.resolve().then(() => {
					throw new BadRequest('Failed to submit transaction.');
				});

			await expect(
				transactionSubmitService.submitTransaction(balancesTransferValid)
			).rejects.toStrictEqual(new BadRequest('Failed to submit transaction.'));

			(mockApi.rpc.author as any).submitExtrinsic = submitExtrinsic;
		});
	});
});
