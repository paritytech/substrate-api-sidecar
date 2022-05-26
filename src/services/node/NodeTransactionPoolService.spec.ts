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
import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import {
	// blockHash789629,
	defaultMockApi,
	pendingExtrinsics,
} from '../test-helpers/mock';
import transactionPoolResponse from '../test-helpers/responses/node/transactionPool.json';
import { NodeTransactionPoolService } from '.';

const nodeTranstionPoolService = new NodeTransactionPoolService(defaultMockApi);

describe('NodeTransactionPoolService', () => {
	describe('fetchTransactionPool', () => {
		it('works when ApiPromiseWorks (no txs)', async () => {
			expect(
				sanitizeNumbers(
					await nodeTranstionPoolService
						.fetchTransactionPool
						// blockHash789629
						()
				)
			).toStrictEqual({ pool: [] });
		});

		it('works when ApiPromiseWorks (1 tx)', async () => {
			const ext = defaultMockApi.createType(
				'Extrinsic',
				'0x4d0284d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d015c41b5e704d89787e5208b863fa815a146a19ade0cd95f2378815d72c52b2644c05f0dd6be3bf219b9963ac9ddeec8d379c0cd1d86d8f33f2c1d1a8006efc180050000001a00040500e659a7a1628cdd93febc04a4e0646ea20e9f5f0ce097d9a05290d4a9e054df4e0f0040767b10c403'
			);

			const pool = defaultMockApi.createType('Vec<Extrinsic>', [ext]);
			(defaultMockApi.rpc.author as any).pendingExtrinsics = () =>
				Promise.resolve().then(() => pool);

			expect(
				sanitizeNumbers(
					await nodeTranstionPoolService
						.fetchTransactionPool
						// blockHash789629
						()
				)
			).toStrictEqual(transactionPoolResponse);

			(defaultMockApi.rpc.author as any).pendingExtrinsics = pendingExtrinsics;
		});
	});
});
