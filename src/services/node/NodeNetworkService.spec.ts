import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { mockApi } from '../test-helpers/mock';
import * as nodeNetworkResponse from '../test-helpers/responses/node/network.json';
import { NodeNetworkService } from '.';

const nodeNetworkService = new NodeNetworkService(mockApi);

describe('NodeNetworkService', () => {
	describe('fetchNetwork', () => {
		it('works when ApiPromise works', async () => {
			expect(
				sanitizeNumbers(await nodeNetworkService.fetchNetwork())
			).toStrictEqual(nodeNetworkResponse);
		});
	});
});
