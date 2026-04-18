// Copyright 2017-2026 Parity Technologies (UK) Ltd.
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

import { ApiPromiseRegistry } from '../../apiRegistry';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import { RuntimeApisService } from './RuntimeApisService';

const runtimeApisService = new RuntimeApisService('mock');
const queryInfoMock = jest.fn().mockResolvedValue({
	toJSON: () => ({ partialFee: '123' }),
});

const runtimeApiAtMock = {
	registry: {
		metadata: {
			apis: {
				toArray: () => [
					{
						name: {
							toString: () => 'TransactionPaymentApi',
						},
						docs: {
							toArray: () => [
								{
									toString: () => 'Transaction payment runtime API',
								},
							],
						},
						methods: [
							{
								name: {
									toString: () => 'query_info',
								},
								docs: {
									toArray: () => [
										{
											toString: () => 'Query transaction fee info',
										},
									],
								},
								inputs: [
									{
										name: {
											toString: () => 'uxt',
										},
										type: {
											toString: () => '0',
										},
									},
									{
										name: {
											toString: () => 'len',
										},
										type: {
											toString: () => '1',
										},
									},
									{
										name: {
											toString: () => 'auth_type',
										},
										type: {
											toString: () => '3',
										},
									},
								],
								output: {
									toString: () => '2',
								},
							},
						],
					},
				],
			},
		},
		lookup: {
			getTypeDef: (lookupId: number) => ({
				lookupName:
					lookupId === 0
						? 'Bytes'
						: lookupId === 1
							? 'u32'
							: lookupId === 2
								? 'RuntimeDispatchInfo'
								: 'Option<AuthorizationType>',
				type:
					lookupId === 0
						? 'Bytes'
						: lookupId === 1
							? 'u32'
							: lookupId === 2
								? 'RuntimeDispatchInfo'
								: 'Option<AuthorizationType>',
			}),
		},
	},
	call: {
		transactionPaymentApi: {
			queryInfo: queryInfoMock,
		},
	},
};

describe('RuntimeApisService', () => {
	beforeAll(() => {
		jest.spyOn(ApiPromiseRegistry, 'getApi').mockImplementation(() => defaultMockApi);
	});

	beforeEach(() => {
		queryInfoMock.mockClear();
	});

	it('fetchRuntimeApis should return runtime API summaries', async () => {
		const result = await runtimeApisService.fetchRuntimeApis(blockHash789629, runtimeApiAtMock as never);

		expect(result.at.hash).toEqual(blockHash789629);
		expect(result.at.height).toEqual('789629');
		expect(result.apis.length).toBeGreaterThan(0);
		expect(result.apis[0].id).toEqual('transactionPaymentApi');
	});

	it('fetchRuntimeApi should resolve runtime APIs by name or id', async () => {
		const byId = await runtimeApisService.fetchRuntimeApi(
			blockHash789629,
			'transactionPaymentApi',
			runtimeApiAtMock as never,
		);
		const byName = await runtimeApisService.fetchRuntimeApi(
			blockHash789629,
			'TransactionPaymentApi',
			runtimeApiAtMock as never,
		);

		expect(byId.api.id).toEqual('transactionPaymentApi');
		expect(byName.api.name).toEqual('TransactionPaymentApi');
	});

	it('callRuntimeApi should invoke a callable runtime API method', async () => {
		const result = await runtimeApisService.callRuntimeApi(
			blockHash789629,
			'transactionPaymentApi',
			'queryInfo',
			{ arg0: '0x00', arg1: 1 },
			runtimeApiAtMock as never,
		);

		expect(result.api.id).toEqual('transactionPaymentApi');
		expect(result.method.id).toEqual('queryInfo');
		expect(result.result).toEqual({ partialFee: '123' });
		expect(queryInfoMock).toHaveBeenCalledTimes(1);
		expect(queryInfoMock).toHaveBeenCalledWith('0x00', 1, null);
	});

	it('callRuntimeApi should allow omitted Option<T> parameters', async () => {
		await runtimeApisService.callRuntimeApi(
			blockHash789629,
			'transactionPaymentApi',
			'queryInfo',
			{ arg0: '0x00', arg1: 1 },
			runtimeApiAtMock as never,
		);

		expect(queryInfoMock).toHaveBeenLastCalledWith('0x00', 1, null);
	});

	it('callRuntimeApi should allow explicit null for Option<T> parameters', async () => {
		await runtimeApisService.callRuntimeApi(
			blockHash789629,
			'transactionPaymentApi',
			'queryInfo',
			{ arg0: '0x00', arg1: 1, authType: null },
			runtimeApiAtMock as never,
		);

		expect(queryInfoMock).toHaveBeenLastCalledWith('0x00', 1, null);
	});

	it('callRuntimeApi should reject unknown runtime API names', async () => {
		await expect(
			runtimeApisService.callRuntimeApi(
				blockHash789629,
				'notRealRuntimeApi',
				'anyMethod',
				{},
				runtimeApiAtMock as never,
			),
		).rejects.toThrow("Runtime API 'notRealRuntimeApi' not found.");
	});

	it('callRuntimeApi should reject unknown method names', async () => {
		await expect(
			runtimeApisService.callRuntimeApi(
				blockHash789629,
				'transactionPaymentApi',
				'notRealMethod',
				{},
				runtimeApiAtMock as never,
			),
		).rejects.toThrow("Runtime API method 'notRealMethod' not found");
	});

	it('callRuntimeApi should validate missing parameters', async () => {
		await expect(
			runtimeApisService.callRuntimeApi(
				blockHash789629,
				'transactionPaymentApi',
				'queryInfo',
				{ arg0: '0x00' },
				runtimeApiAtMock as never,
			),
		).rejects.toThrow('Missing parameter');
	});

	it('callRuntimeApi should validate unknown parameter keys', async () => {
		await expect(
			runtimeApisService.callRuntimeApi(
				blockHash789629,
				'transactionPaymentApi',
				'queryInfo',
				{ arg0: '0x00', arg1: 1, extra: 'unexpected' },
				runtimeApiAtMock as never,
			),
		).rejects.toThrow('Unknown parameter keys');
	});
});
