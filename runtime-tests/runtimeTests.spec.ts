import { endpoints } from './endpoints';
import { PORT, URL_PATH } from './helpers/consts';
import { request } from './helpers/request';
import { BlockResponse, ChainConfig, ChainSpec } from './types';

const config = JSON.parse(process.env.__CONFIGURATION as string) as ChainConfig;
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
			const res = await request(blockPath, URL_PATH, PORT);
			const responseJson = JSON.parse(res) as BlockResponse;

			expect(responseJson['number']).toBe(blockHeight);
		}
	);
});
