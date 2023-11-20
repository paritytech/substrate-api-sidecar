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

import { ContractPromise } from '@polkadot/api-contract';

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { polkadotRegistryV9190 } from '../../test-helpers/registries';
import { defaultMockApi } from '../test-helpers/mock';
import { ContractsInkService } from '.';

const contractInkService = new ContractsInkService(defaultMockApi);

const getFlipper = () =>
	Promise.resolve().then(() => {
		return {
			debugMessage: polkadotRegistryV9190.createType('Text', ''),
			gasConsumed: polkadotRegistryV9190.createType('u64', '7437907045'),
			gasRequired: polkadotRegistryV9190.createType('u64', '74999922688'),
			output: true,
			result: polkadotRegistryV9190.createType('ContractExecResultResult', {
				ok: {
					flags: [],
					data: '0x01',
				},
			}),
			storageDeposit: polkadotRegistryV9190.createType('StorageDeposit', {
				charge: '0',
			}),
		};
	});

const mockContractPromise = {
	query: {
		get: getFlipper,
	},
} as unknown as ContractPromise;

describe('ContractsInkService', () => {
	it('fetchContractCall', async () => {
		const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
		const result = await contractInkService.fetchContractCall(mockContractPromise, address, 'get');
		const expectedResponse = {
			debugMessage: '',
			gasConsumed: '7437907045',
			gasRequired: '74999922688',
			output: true,
			result: {
				ok: {
					flags: [],
					data: '0x01',
				},
			},
			storageDeposit: {
				charge: '0',
			},
		};

		expect(sanitizeNumbers(result)).toStrictEqual(expectedResponse);
	});
});
