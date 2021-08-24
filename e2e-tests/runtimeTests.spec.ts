import { endpoints } from './endpoints';
import { HOST, PORT } from './helpers/consts';
import { request } from './helpers/request';
import { BlockResponse, ChainSpec, IEnvChainConfig } from './types';

const config = JSON.parse(
	process.env.__SAS_RUNTIME_TEST_CONFIGURATION as string
) as IEnvChainConfig;

const chain = config.chain as ChainSpec;

const { blocks, accounts } = endpoints[chain];

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
			const responseJson = JSON.parse(res) as BlockResponse;

			expect(responseJson).toStrictEqual(JSON.parse(blockResponse));
		}
	);

	/**
	 * Test runtiems for `/accounts/*`
	 */
	test.each(accounts)(
		'Given path %p, it should return the correct',
		async (accountsPath, accountsResponse) => {
			const res = await request(accountsPath, HOST, PORT);
			const responseJson = JSON.parse(res) as string;

			expect(responseJson).toStrictEqual(JSON.parse(accountsResponse));
		}
	);
});
