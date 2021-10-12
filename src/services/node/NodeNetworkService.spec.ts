import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { defaultMockApi } from '../test-helpers/mock';
import nodeNetworkResponse from '../test-helpers/responses/node/network.json';
import { NodeNetworkService } from '.';

const nodeNetworkService = new NodeNetworkService(defaultMockApi);

describe('NodeNetworkService', () => {
	describe('fetchNetwork', () => {
		it('works when ApiPromise works', async () => {
			expect(
				sanitizeNumbers(await nodeNetworkService.fetchNetwork())
			).toStrictEqual(nodeNetworkResponse);
		});
	});
});
