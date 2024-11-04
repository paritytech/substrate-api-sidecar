/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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

import type { ApiPromise } from '@polkadot/api';
import type { DispatchError, PostDispatchInfo } from '@polkadot/types/interfaces';

import { TransactionResultType } from '../../types/responses';
import { blockHash22887036, mockAssetHubWestendApi, mockDryRunCall, mockDryRunError } from '../test-helpers/mock';
import { mockDryRunCallResult } from '../test-helpers/mock/mockDryRunCall';
import { mockDryRunCallError } from '../test-helpers/mock/mockDryRunError';
import { TransactionDryRunService } from './TransactionDryRunService';

const mockAHWApi = {
	...mockAssetHubWestendApi,
	call: {
		dryRunApi: {
			dryRunCall: mockDryRunCall,
		},
	},
} as unknown as ApiPromise;

describe('TransactionDryRunService', () => {
	const sendersAddress = '5HBuLJz9LdkUNseUEL6DLeVkx2bqEi6pQr8Ea7fS4bzx7i7E';
	it('Should correctly execute a dry run for a submittable executable', async () => {
		const executionResult = await new TransactionDryRunService(mockAHWApi).dryRuntExtrinsic(
			sendersAddress,
			'0xfc041f0801010100411f0100010100c224aad9c6f3bbd784120e9fceee5bfd22a62c69144ee673f76d6a34d280de160104000002043205040091010000000000',
			blockHash22887036,
		);

		expect(executionResult?.at.hash).toEqual(blockHash22887036);
		const resData = executionResult?.result.result as PostDispatchInfo;
		expect(executionResult?.result.resultType).toEqual(TransactionResultType.DispatchOutcome);
		expect(resData.paysFee.toString()).toEqual(mockDryRunCallResult.Ok.executionResult.Ok.paysFee);
	});

	it('should correctly execute a dry run for a payload extrinsic', async () => {
		const payloadTx: `0x${string}` =
			'0xf81f0801010100411f0100010100c224aad9c6f3bbd784120e9fceee5bfd22a62c69144ee673f76d6a34d280de16010400000204320504009101000000000045022800010000e0510f00040000000000000000000000000000000000000000000000000000000000000000000000be2554aa8a0151eb4d706308c47d16996af391e4c5e499c7cbef24259b7d4503';

		const executionResult = await new TransactionDryRunService(mockAHWApi).dryRuntExtrinsic(
			sendersAddress,
			payloadTx,
			blockHash22887036,
		);

		const resData = executionResult?.result.result as PostDispatchInfo;

		expect(resData.paysFee.toString()).toEqual(mockDryRunCallResult.Ok.executionResult.Ok.paysFee);
	});

	it('should correctly execute a dry run for a call', async () => {
		const callTx =
			'0x1f0801010100411f0100010100c224aad9c6f3bbd784120e9fceee5bfd22a62c69144ee673f76d6a34d280de160104000002043205040091010000000000' as `0x${string}`;

		const executionResult = await new TransactionDryRunService(mockAHWApi).dryRuntExtrinsic(sendersAddress, callTx);

		expect(executionResult?.at.hash).toEqual('');
		const resData = executionResult?.result.result as PostDispatchInfo;
		expect(resData.paysFee.toString()).toEqual(mockDryRunCallResult.Ok.executionResult.Ok.paysFee);
	});

	it('should correctly execute a dry run for a call and return an error', async () => {
		const mockAHWApiErr = {
			...mockAssetHubWestendApi,
			call: {
				dryRunApi: {
					dryRunCall: mockDryRunError,
				},
			},
		} as unknown as ApiPromise;

		const callTx =
			'0x0a0000fe06fc3db07fb1a4ce89a76eaed1e54519b5940d2652b8d6794ad4ddfcdcb16c0f00d0eca2b99401' as `0x${string}`;

		const executionResult = await new TransactionDryRunService(mockAHWApiErr).dryRuntExtrinsic(sendersAddress, callTx);

		expect(executionResult?.at.hash).toEqual('');
		const resData = executionResult?.result.result as DispatchError;
		expect(resData.asToken.toString()).toEqual(mockDryRunCallError.Ok.executionResult.Err.Token);
	});
});
