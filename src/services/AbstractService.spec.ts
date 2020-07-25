import { ApiPromise } from '@polkadot/api';
import * as getSpecTypesModule from '@polkadot/types-known';
import { BlockHash } from '@polkadot/types/interfaces';
import U32 from '@polkadot/types/primitive/U32';
import { Metadata } from 'src/controllers';

import { kusamaRegistry } from '../utils/testTools';
import { AbstractService } from './AbstractService';

// Mock methods for api
const getRuntimeVersion = (_hash: string) =>
	Promise.resolve().then(() => {
		return {
			transactionVersion: new U32(kusamaRegistry, 2),
			specVersion: new U32(kusamaRegistry, 17),
			specName: 'kusama',
		};
	});

const getMetadata = () => Promise.resolve().then(() => 'getMetadata data');

const chain = () => Promise.resolve().then(() => 'chain data');

const setMetadata = () => (_metadata: Metadata) => 'setMetadata set!';

const register = (..._args: unknown[]) => 'registered!';

/**
 * Mock polkadot-js ApiPromise. This is its own thing for now just for
 * simplicity sake. In the future this may be replaced by `mockApi` in ./utils/mock
 */
const api = {
	createType: kusamaRegistry.createType.bind(kusamaRegistry),
	registry: {
		register,
		setMetadata,
	},
	rpc: {
		state: {
			getRuntimeVersion,
			getMetadata,
		},
		system: {
			chain,
		},
	},
};

/**
 * MockService class that minimally extends AbstractService in order to test it.
 */
class MockService extends AbstractService {
	/**
	 * Publicly expose ensureMeta for the sake of testing.
	 *
	 * @param hash string representing a BlockHash
	 */
	async pubEnsureMeta(hash: string) {
		return await this.ensureMeta((hash as unknown) as BlockHash);
	}
}

/**
 * Mock `getSpecTypes`.
 *
 * Remember to mockClear at the beginning of a test if checking jest stats.
 */
const getSpecTypesSPY = jest.spyOn(getSpecTypesModule, 'getSpecTypes');
getSpecTypesSPY.mockReturnValue({ mock: 'specTypes!' });

/**
 * Instantiate an instance of MockService and do initial insertions after
 * calling `pubEnsureMeta` once.
 */
async function mockServiceSetup() {
	const mockService = new MockService((api as unknown) as ApiPromise);
	await mockService.pubEnsureMeta('0xDummyBlockHash');
	expect(mockService['txVersion'].toNumber()).toBe(2);
	expect(mockService['specVersion'].toNumber()).toBe(17);

	return mockService;
}

/**
 * Create a mockService and assert that `txVersion` and `specVersion`
 * are the same as `versionReset`. Useful in contexts when a function called
 * inside of `ensureMeta` will throw.
 */
async function assertVersionsAreVersionReset() {
	const temp = console.error;
	console.error = jest.fn();

	const mockService = new MockService((api as unknown) as ApiPromise);
	await mockService.pubEnsureMeta('0xDummyBlockHash');
	expect(mockService['txVersion'].toNumber()).toBe(
		mockService['versionReset']
	);
	expect(mockService['specVersion'].toNumber()).toBe(
		mockService['versionReset']
	);

	expect(console.error).toBeCalled();
	console.error = temp;
}

describe('AbstractService', () => {
	it('uses a versionReset value that is bigger than any runtime version in the forseeable future', () => {
		expect(
			new MockService((api as unknown) as ApiPromise)['versionReset']
		).toBe(99999999);
	});

	it('initializes specVersion and txVersion to versionReset', () => {
		const mockService = new MockService((api as unknown) as ApiPromise);
		expect(mockService['specVersion'].toNumber()).toBe(
			mockService['versionReset']
		);
		expect(mockService['txVersion'].toNumber()).toBe(
			mockService['versionReset']
		);
	});

	describe('ensureMeta', () => {
		it('does not change metadata, specVersion or txVersion when they are static', async () => {
			api.registry.setMetadata = jest.fn();
			const mockService = await mockServiceSetup();
			expect(api.registry.setMetadata).toHaveBeenCalledTimes(1);

			api.registry.setMetadata = jest.fn();

			// Second call to assert the values have not changed
			await mockService.pubEnsureMeta('0xDummyBlockHash');
			expect(mockService['txVersion'].toNumber()).toBe(2);
			expect(mockService['specVersion'].toNumber()).toBe(17);
			expect(api.registry.setMetadata).not.toHaveBeenCalled();

			api.registry.setMetadata = setMetadata;
		});

		it('resets metadata and correctly changes versions when versions have changed', async () => {
			api.registry.setMetadata = jest.fn();

			const mockService = await mockServiceSetup();
			expect(api.registry.setMetadata).toHaveBeenCalledTimes(1);

			api.registry.setMetadata = jest.fn();

			api.rpc.state.getRuntimeVersion = (_hash: string) =>
				Promise.resolve().then(() => {
					return {
						transactionVersion: new U32(kusamaRegistry, 3),
						specVersion: new U32(kusamaRegistry, 18),
						specName: 'kusama',
					};
				});

			await mockService.pubEnsureMeta('0xDummyBlockHash');
			expect(mockService['txVersion'].toNumber()).toBe(3);
			expect(mockService['specVersion'].toNumber()).toBe(18);
			expect(api.registry.setMetadata).toHaveBeenCalledTimes(1);

			api.rpc.state.getRuntimeVersion = getRuntimeVersion;
			api.registry.setMetadata = setMetadata;
		});

		it('does not call api.registry.register when versions have not changed', async () => {
			api.registry.register = jest.fn();

			const mockService = await mockServiceSetup();
			expect(api.registry.register).toHaveBeenCalledTimes(1);
			expect(api.registry.register).toBeCalledWith({
				mock: 'specTypes!',
			});

			api.registry.register = jest.fn();

			await mockService.pubEnsureMeta('0xDummyBlockHash');
			expect(mockService['txVersion'].toNumber()).toBe(2);
			expect(mockService['specVersion'].toNumber()).toBe(17);
			expect(api.registry.register).not.toHaveBeenCalled();

			api.registry.register = register;
		});

		it('calls api.registry.register when versions have changed', async () => {
			api.registry.register = jest.fn();

			const mockService = await mockServiceSetup();
			expect(api.registry.register).toHaveBeenCalledTimes(1);
			expect(api.registry.register).toBeCalledWith({
				mock: 'specTypes!',
			});

			api.rpc.state.getRuntimeVersion = (_hash: string) =>
				Promise.resolve().then(() => {
					return {
						transactionVersion: new U32(kusamaRegistry, 3),
						specVersion: new U32(kusamaRegistry, 18),
						specName: 'kusama',
					};
				});

			api.registry.register = jest.fn();

			await mockService.pubEnsureMeta('0xDummyBlockHash');
			expect(mockService['txVersion'].toNumber()).toBe(3);
			expect(mockService['specVersion'].toNumber()).toBe(18);
			expect(api.registry.register).toHaveBeenCalledTimes(1);
			expect(api.registry.register).toBeCalledWith({
				mock: 'specTypes!',
			});

			api.rpc.state.getRuntimeVersion = getRuntimeVersion;
			api.registry.register = register;
		});

		it('resets metadata and just changes `txVersion` when just the `txVersion` has changed', async () => {
			const mockService = await mockServiceSetup();

			api.rpc.state.getRuntimeVersion = (_hash: string) =>
				Promise.resolve().then(() => {
					return {
						transactionVersion: new U32(kusamaRegistry, 3),
						specVersion: new U32(kusamaRegistry, 17),
						specName: 'kusama',
					};
				});

			api.registry.setMetadata = jest.fn();
			const temp = console.warn;
			console.warn = jest.fn();

			await mockService.pubEnsureMeta('0xDummyBlockHash');
			expect(mockService['txVersion'].toNumber()).toBe(3);
			expect(mockService['specVersion'].toNumber()).toBe(17);
			expect(api.registry.setMetadata).toBeCalledTimes(1);
			expect(api.registry.setMetadata).toBeCalledWith('getMetadata data');
			expect(console.warn).toBeCalledTimes(1);

			console.warn = temp;
			api.rpc.state.getRuntimeVersion = getRuntimeVersion;
			api.registry.setMetadata = setMetadata;
		});

		it('resets metadata and just changes `specVersion` when just the `specVersion` has changed', async () => {
			const mockService = await mockServiceSetup();

			api.rpc.state.getRuntimeVersion = (_hash: string) =>
				Promise.resolve().then(() => {
					return {
						transactionVersion: new U32(kusamaRegistry, 2),
						specVersion: new U32(kusamaRegistry, 18),
						specName: 'kusama',
					};
				});

			api.registry.setMetadata = jest.fn();

			await mockService.pubEnsureMeta('0xDummyBlockHash');
			expect(mockService['txVersion'].toNumber()).toBe(2);
			expect(mockService['specVersion'].toNumber()).toBe(18);
			expect(api.registry.setMetadata).toBeCalledTimes(1);
			expect(api.registry.setMetadata).toBeCalledWith('getMetadata data');

			api.rpc.state.getRuntimeVersion = getRuntimeVersion;
			api.registry.setMetadata = setMetadata;
		});

		it('catches getRuntimeVersion throw and does a version reset', async () => {
			api.rpc.state.getRuntimeVersion = () =>
				Promise.resolve().then(() => {
					throw 'the future is version-less';
				});

			await assertVersionsAreVersionReset();

			api.rpc.state.getRuntimeVersion = getRuntimeVersion;
		});

		it('catches getMetadata throw and does a version reset', async () => {
			api.rpc.state.getMetadata = () =>
				Promise.resolve().then(() => {
					throw 'existential';
				});

			await assertVersionsAreVersionReset();

			api.rpc.state.getMetadata = getMetadata;
		});

		it('catches chain throw and does a version reset', async () => {
			api.rpc.system.chain = () =>
				Promise.resolve().then(() => {
					throw 'AAAAAHHHHHHHH';
				});

			await assertVersionsAreVersionReset();

			api.rpc.system.chain = chain;
		});
	});
});
