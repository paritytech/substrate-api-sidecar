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

import { endpoints } from './endpoints';
import { HOST, PORT } from './helpers/consts';
import { request } from './helpers/request';
import {
	AccountsResponse,
	ChainSpec,
	IBlockResponse,
	IEnvChainConfig,
	RuntimeResponse,
} from './types';

const config = JSON.parse(
	process.env.__SAS_RUNTIME_TEST_CONFIGURATION as string
) as IEnvChainConfig;

const chain = config.chain as ChainSpec;

const { blocks, accounts, runtime, paras } = endpoints[chain];

describe('Runtime Tests for blocks', () => {
	/**
	 * Allows a timeout of 30 seconds for each response.
	 */
	jest.setTimeout(30000);

	/**
	 * Test runtimes for `/blocks`
	 */
	if (blocks.length) {
		test.each(blocks)(
			'Given path %p, it should return the correct JSON response',
			async (blockPath, blockResponse) => {
				const res = await request(blockPath, HOST, PORT);
				const responseJson = JSON.parse(res) as IBlockResponse;

				expect(responseJson).toStrictEqual(JSON.parse(blockResponse));
			}
		);
	}
});

describe('Runtime Tests for accounts', () => {
	/**
	 * Allows a timeout of 30 seconds for each response.
	 */
	jest.setTimeout(30000);

	/**
	 * Test runtiems for `/accounts/*`
	 */
	if (accounts.length) {
		test.each(accounts)(
			'Given path %p, it should return the correct JSON response',
			async (accountsPath, accountsResponse) => {
				const res = await request(accountsPath, HOST, PORT);
				const responseJson = JSON.parse(res) as AccountsResponse;

				expect(responseJson).toStrictEqual(JSON.parse(accountsResponse));
			}
		);
	}
});

describe('Runtime Tests for `/runtime/*`', () => {
	/**
	 * Allows a timeout of 30 seconds for each response.
	 */
	jest.setTimeout(30000);

	if (runtime.length) {
		test.each(runtime)(
			'Given path %p, it should return the correct JSON response',
			async (runtimePath, runtimeResponse) => {
				const res = await request(runtimePath, HOST, PORT);
				const responseJson = JSON.parse(res) as RuntimeResponse;

				expect(responseJson).toStrictEqual(JSON.parse(runtimeResponse));
			}
		);
	}
});

describe('Runtime Tests for `/paras/*`', () => {
	/**
	 * Allows a timeout of 30 seconds for each response.
	 */
	jest.setTimeout(30000);

	if (paras.length) {
		test.each(paras)(
			'Given path %p, it should return the correct JSON response',
			async (runtimePath, runtimeResponse) => {
				const res = await request(runtimePath, HOST, PORT);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const responseJson = JSON.parse(res);

				expect(responseJson).toStrictEqual(JSON.parse(runtimeResponse));
			}
		);
	}
});
