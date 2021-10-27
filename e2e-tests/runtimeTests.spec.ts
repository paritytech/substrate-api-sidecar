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
	test.each(blocks)(
		'Given path %p, it should return the correct JSON response',
		async (blockPath, blockResponse) => {
			const res = await request(blockPath, HOST, PORT);
			const responseJson = JSON.parse(res) as IBlockResponse;

			expect(responseJson).toStrictEqual(JSON.parse(blockResponse));
		}
	);
});

describe('Runtime Tests for accounts', () => {
	/**
	 * Allows a timeout of 30 seconds for each response.
	 */
	jest.setTimeout(30000);

	/**
	 * Test runtiems for `/accounts/*`
	 */
	test.each(accounts)(
		'Given path %p, it should return the correct JSON response',
		async (accountsPath, accountsResponse) => {
			const res = await request(accountsPath, HOST, PORT);
			const responseJson = JSON.parse(res) as AccountsResponse;

			expect(responseJson).toStrictEqual(JSON.parse(accountsResponse));
		}
	);
});

describe('Runtime Tests for `/runtime/*`', () => {
	/**
	 * Allows a timeout of 30 seconds for each response.
	 */
	jest.setTimeout(30000);

	test.each(runtime)(
		'Given path %p, it should return the correct JSON response',
		async (runtimePath, runtimeResponse) => {
			const res = await request(runtimePath, HOST, PORT);
			const responseJson = JSON.parse(res) as RuntimeResponse;

			expect(responseJson).toStrictEqual(JSON.parse(runtimeResponse));
		}
	);
});

describe('Runtime Tests for `/experimental/paras/*`', () => {
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
