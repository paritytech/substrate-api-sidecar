import { endpoints } from './endpoints';
import { HOST, PORT } from './helpers/consts';
import { request } from './helpers/request';
import { BlockResponse, ChainConfig, ChainSpec } from './types';

const config = JSON.parse(
	process.env.__SAS_RUNTIME_TEST_CONFIGURATION as string
) as ChainConfig;
const chain = config.chain as ChainSpec;

const polkadotEndpoints: string[][] = endpoints[chain];

describe('Runtime Tests for blocks', () => {
	/**
	 * Allows a timeout of 30 seconds for each response.
	 */
	jest.setTimeout(30000);

	/**
	 * Test runtimes for `/blocks`
	 */
	test.each(polkadotEndpoints)(
		'Given path %p, it should return the correct JSON response',
		async (blockPath, blockResponse) => {
			const res = await request(blockPath, HOST, PORT);
			const responseJson = JSON.parse(res) as BlockResponse;

			expect(responseJson).toStrictEqual(JSON.parse(blockResponse));
		}
	);
});
