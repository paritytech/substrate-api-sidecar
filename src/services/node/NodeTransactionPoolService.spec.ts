// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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
import { polkadotRegistryV9300 } from '../../test-helpers/registries';
import { defaultMockApi, pendingExtrinsics } from '../test-helpers/mock';
import transactionPoolResponse from '../test-helpers/responses/node/transactionPool.json';
import transactionPoolWithTipResponse from '../test-helpers/responses/node/transactionPoolWithTip.json';
import transactionPoolWithTipOperationalResponse from '../test-helpers/responses/node/transactionPoolWithTipOperational.json';
import { NodeTransactionPoolService } from '.';

const nodeTransactionPoolService = new NodeTransactionPoolService(defaultMockApi);

describe('NodeTransactionPoolService', () => {
	describe('fetchTransactionPool', () => {
		it('works when ApiPromiseWorks (no txs)', async () => {
			expect(sanitizeNumbers(await nodeTransactionPoolService.fetchTransactionPool(false))).toStrictEqual({ pool: [] });
		});

		it('works when ApiPromiseWorks (1 tx)', async () => {
			const ext = defaultMockApi.createType(
				'Extrinsic',
				'0x4d0284d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d015c41b5e704d89787e5208b863fa815a146a19ade0cd95f2378815d72c52b2644c05f0dd6be3bf219b9963ac9ddeec8d379c0cd1d86d8f33f2c1d1a8006efc180050000001a00040500e659a7a1628cdd93febc04a4e0646ea20e9f5f0ce097d9a05290d4a9e054df4e0f0040767b10c403',
			);

			const pool = defaultMockApi.createType('Vec<Extrinsic>', [ext]);
			(defaultMockApi.rpc.author as any).pendingExtrinsics = () => Promise.resolve().then(() => pool);

			expect(sanitizeNumbers(await nodeTransactionPoolService.fetchTransactionPool(false))).toStrictEqual(
				transactionPoolResponse,
			);

			(defaultMockApi.rpc.author as any).pendingExtrinsics = pendingExtrinsics;
		});

		it('works when query param `includeFee` is set to true for normal extrinsics', async () => {
			// This test does not use the same metadata in defaultMockApi. It changes it to v9190,
			// and sets it back to the default value after.
			const normalExt = polkadotRegistryV9300.createType(
				'Extrinsic',
				'0x4d028400d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d0196a6cd1652fc83c449884f67e8f444587b69c5874512f1d746ff6f062a097b2acedfe8d2e07915b4c93cc1c3b48a16ebccc1db8eb810146373ba53c9f42ab48e4500000284d717050300e281b7ec09fb8420ca7ba3fbd627fbe203ff04b2ba0777ae1d8a6942257af0230700e8764817',
			);
			const pool = polkadotRegistryV9300.createType('Vec<Extrinsic>', [normalExt]);
			(defaultMockApi.rpc.author as any).pendingExtrinsics = () => Promise.resolve().then(() => pool);

			expect(sanitizeNumbers(await nodeTransactionPoolService.fetchTransactionPool(true))).toStrictEqual(
				transactionPoolWithTipResponse,
			);

			(defaultMockApi.rpc.author as any).pendingExtrinsics = pendingExtrinsics;
		});

		it('works when query param `includeFee` is set to true for operational extrinsics', async () => {
			const operationalExt = polkadotRegistryV9300.createType(
				'Extrinsic',
				'0x350284004adf51a47b72795366d52285e329229c836ea7bbfe139dbe8fa0700c4f86fc5601fc44dcd1994c111671b3577b02e391be8aff10f7ccf766f3189859ea343db041779a67f9357cba0ba051f83d63e45e7a88b5e2ca642181592052acd9f4ccc8821501c107000f03f2af187bbc8a4a2b5a28c2a3c2d85bf7e5b1700cbf1207a8e4c1eb7d8e7e4037350301',
			);
			const pool = polkadotRegistryV9300.createType('Vec<Extrinsic>', [operationalExt]);
			(defaultMockApi.rpc.author as any).pendingExtrinsics = () => Promise.resolve().then(() => pool);

			expect(sanitizeNumbers(await nodeTransactionPoolService.fetchTransactionPool(true))).toStrictEqual(
				transactionPoolWithTipOperationalResponse,
			);

			(defaultMockApi.rpc.author as any).pendingExtrinsics = pendingExtrinsics;
		});
	});
});
