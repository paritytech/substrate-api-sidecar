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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ApiPromise } from '@polkadot/api';
import { Hash } from '@polkadot/types/interfaces';

import { ApiPromiseRegistry } from '../../apiRegistry';
import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistryV9300, polkadotRegistryV1003000 } from '../../test-helpers/registries';
import {
	balancesTransferInvalid,
	balancesTransferKeepAliveValid,
	balancesTransferValid,
	blockHash789629,
	blockHash22887036,
	defaultMockApi,
	mockApiBlock22887036,
	queryInfoAt,
	tx22887036,
} from '../test-helpers/mock';
import invalidResponse from '../test-helpers/responses/transaction/feeEstimateInvalid.json';
import validRpcResponse from '../test-helpers/responses/transaction/feeEstimateValidRpcCall.json';
import validRuntimeResponse from '../test-helpers/responses/transaction/feeEstimateValidRuntimeCall.json';
import validRuntimeResponse22887036 from '../test-helpers/responses/transaction/feeEstimateValidRuntimeCall22887036.json';
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

const transactionFeeEstimateService = new TransactionFeeEstimateService('mock');

// Mocking the API at block 22887036
const queryInfoCallAt22887036 = () =>
	Promise.resolve().then(() =>
		polkadotRegistryV1003000.createType('RuntimeDispatchInfoV2', {
			weight: {
				refTime: '145570000',
				proofSize: '3593',
			},
			class: 'Normal',
			partialFee: '159154905',
		}),
	);

const mockApiAt22887036 = {
	call: {
		transactionPaymentApi: {
			queryInfo: queryInfoCallAt22887036,
		},
	},
};

const mockApi22887036 = {
	...mockApiBlock22887036,
	tx: tx22887036,
	at: (_hash: Hash) => mockApiAt22887036,
} as unknown as ApiPromise;

const transactionFeeEstimateService22887036 = new TransactionFeeEstimateService('mock');

describe('TransactionFeeEstimateService', () => {
	describe('fetchTransactionFeeEstimate', () => {
		it('Works with a valid transaction', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi);
			expect(
				sanitizeNumbers(
					await transactionFeeEstimateService.fetchTransactionFeeEstimate(
						mockApi,
						blockHash789629,
						balancesTransferValid,
					),
				),
			).toStrictEqual(validRuntimeResponse);
		});

		it('Works with a valid transaction at block 22887036', async () => {
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi22887036);
			expect(
				sanitizeNumbers(
					await transactionFeeEstimateService22887036.fetchTransactionFeeEstimate(
						mockApi22887036,
						blockHash22887036,
						balancesTransferKeepAliveValid,
					),
				),
			).toStrictEqual(validRuntimeResponse22887036);
		});

		it("Should default to the rpc call when the runtime call doesn't exist", async () => {
			(mockApiAt.call.transactionPaymentApi.queryInfo as unknown) = undefined;
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi);
			expect(
				sanitizeNumbers(
					await transactionFeeEstimateService.fetchTransactionFeeEstimate(
						mockApi,
						blockHash789629,
						balancesTransferValid,
					),
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
			jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => mockApi);
			await expect(
				transactionFeeEstimateService.fetchTransactionFeeEstimate(mockApi, blockHash789629, balancesTransferInvalid),
			).rejects.toStrictEqual(invalidResponse);

			(mockApi.rpc.payment as any).queryInfo = queryInfoAt;
			(mockApiAt.call.transactionPaymentApi.queryInfo as unknown) = queryInfoCallAt;
		});
	});
});
