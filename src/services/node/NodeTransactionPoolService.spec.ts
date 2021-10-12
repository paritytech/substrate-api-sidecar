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
