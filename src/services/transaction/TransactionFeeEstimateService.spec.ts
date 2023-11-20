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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ApiPromise } from '@polkadot/api';
import { Hash } from '@polkadot/types/interfaces';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistryV9300 } from '../../test-helpers/registries';
import {
	balancesTransferInvalid,
	balancesTransferValid,
	blockHash789629,
	defaultMockApi,
	queryInfoAt,
} from '../test-helpers/mock';
import invalidResponse from '../test-helpers/responses/transaction/feeEstimateInvalid.json';
import validRpcResponse from '../test-helpers/responses/transaction/feeEstimateValidRpcCall.json';
import validRuntimeResponse from '../test-helpers/responses/transaction/feeEstimateValidRuntimeCall.json';
import { TransactionFeeEstimateService } from './TransactionFeeEstimateService';

const queryInfoCallAt = () =>
	Promise.resolve().then(() =>
		polkadotRegistryV9300.createType('RuntimeDispatchInfoV2', {
			weight: {
				refTime: '133179000',
				proofSize: '0',
			},
			class: 'Normal',
			partialFee: '171607466',
		}),
	);

const mockApiAt = {
	call: {
		transactionPaymentApi: {
			queryInfo: queryInfoCallAt,
		},
	},
};

const mockApi = {
	...defaultMockApi,
	at: (_hash: Hash) => mockApiAt,
} as unknown as ApiPromise;

const transactionFeeEstimateService = new TransactionFeeEstimateService(mockApi);

describe('TransactionFeeEstimateService', () => {
	describe('fetchTransactionFeeEstimate', () => {
		it('Works with a valid transaction', async () => {
			expect(
				sanitizeNumbers(
					await transactionFeeEstimateService.fetchTransactionFeeEstimate(blockHash789629, balancesTransferValid),
				),
			).toStrictEqual(validRuntimeResponse);
		});

		it("Should default to the rpc call when the runtime call doesn't exist", async () => {
			(mockApiAt.call.transactionPaymentApi.queryInfo as unknown) = undefined;

			expect(
				sanitizeNumbers(
					await transactionFeeEstimateService.fetchTransactionFeeEstimate(blockHash789629, balancesTransferValid),
				),
			).toStrictEqual(validRpcResponse);

			(mockApiAt.call.transactionPaymentApi.queryInfo as unknown) = queryInfoCallAt;
		});

		it('Catches ApiPromise throws and then throws the correct error format', async () => {
			const err = new Error('2: Unable to query dispatch info.: Invalid transaction version');
			err.stack =
				'Error: 2: Unable to query dispatch info.: Invalid transaction version\n  ... this is a unit test mock';

			(mockApiAt.call.transactionPaymentApi.queryInfo as unknown) = undefined;
			(mockApi.rpc.payment as any).queryInfo = () =>
				Promise.resolve().then(() => {
					throw err;
				});

			await expect(
				transactionFeeEstimateService.fetchTransactionFeeEstimate(blockHash789629, balancesTransferInvalid),
			).rejects.toStrictEqual(invalidResponse);

			(mockApi.rpc.payment as any).queryInfo = queryInfoAt;
			(mockApiAt.call.transactionPaymentApi.queryInfo as unknown) = queryInfoCallAt;
		});
	});
});
