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

import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, defaultMockApi } from '../test-helpers/mock';
import response789629 from '../test-helpers/responses/transaction/material789629.json';
import { TransactionMaterialService } from './TransactionMaterialService';

const transactionMaterialService = new TransactionMaterialService(defaultMockApi);

describe('TransactionMaterialService', () => {
	describe('getTransactionMaterial', () => {
		it('Should return the scale encoded metadata when the `metadata` query param is `scale`', async () => {
			expect(
				sanitizeNumbers(await transactionMaterialService.fetchTransactionMaterial(blockHash789629, 'scale')),
			).toStrictEqual(response789629);
		});

		it('Should return the decoded metadata when the `metadata` query param is `json`', async () => {
			const res = await transactionMaterialService.fetchTransactionMaterial(blockHash789629, 'json');
			// Confirms the returned metadata is not a hex string.
			expect(typeof res.metadata).toBe('object');
		});

		it('Should return the response with no metadata when the default behavior is false', async () => {
			const expectedRes = {
				at: {
					hash: '0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
					height: '789629',
				},
				genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
				chainName: 'Polkadot',
				specName: 'polkadot',
				specVersion: '16',
				txVersion: '2',
			};

			const res = await transactionMaterialService.fetchTransactionMaterial(blockHash789629, false);

			expect(sanitizeNumbers(res)).toStrictEqual(expectedRes);
		});
	});
});
