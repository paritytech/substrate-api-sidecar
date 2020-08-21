import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { blockHash789629, mockApi } from '../test-helpers/mock';
import * as nodeNetworkResponse from '../test-helpers/responses/node/nodeNetwork.json';
import { NodeNetworkService } from '.';

const nodeNetworkService = new NodeNetworkService(mockApi);

describe('NodeNetworkService', () => {
	describe('getNodeNetworking', () => {
		it('works when ApiPromise works', async () => {
			expect(
				sanitizeNumbers(
					await nodeNetworkService.fetchNetwork(blockHash789629)
				)
			).toStrictEqual(nodeNetworkResponse);
		});
	});
});
