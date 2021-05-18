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
	jest.setTimeout(15000);

	/**
	 * Test runtimes for `/blocks`
	 */
	test.each(polkadotEndpoints)(
		'Given path %p, it should return block height %p',
		async (blockPath, blockHeight) => {
			const res = await request(blockPath, HOST, PORT);
			const responseJson = JSON.parse(res) as BlockResponse;

			expect(responseJson['number']).toBe(blockHeight);
		}
	);
});
