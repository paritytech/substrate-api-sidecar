import { sanitizeNumbers } from '../../sanitize/sanitizeNumbers';
import { mockApi } from '../test-helpers/mock';
import * as nodeVersionResponse from '../test-helpers/responses/node/version.json';
import { NodeVersionService } from '.';

const nodeVersionService = new NodeVersionService(mockApi);

describe('NodeVersionService', () => {
	describe('fetchVersion', () => {
		it('works when ApiPromise works', async () => {
			expect(
				sanitizeNumbers(await nodeVersionService.fetchVersion())
			).toStrictEqual(nodeVersionResponse);
		});
	});
});
