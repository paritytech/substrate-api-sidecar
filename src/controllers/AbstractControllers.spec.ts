import { ApiPromise } from '@polkadot/api';
import { Compact } from '@polkadot/types';
import { BlockHash, BlockNumber } from '@polkadot/types/interfaces';
import { BadRequest, InternalServerError } from 'http-errors';

import { kusamaRegistry } from '../utils/test_util';
import AbstractController from './AbstractController';

const promiseBlockHash = (num: number): Promise<BlockHash> =>
	new Promise((resolve, reject) => {
		if (num > 100) {
			reject();
		} else {
			resolve(
				kusamaRegistry.createType(
					'BlockHash',
					'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724'
				)
			);
		}
	});

const promiseHeader = (): Promise<{ number: Compact<BlockNumber> }> =>
	new Promise((resolve, _reject) => {
		resolve({
			number: kusamaRegistry.createType('Compact<BlockNumber>', 100),
		});
	});

const api = {
	createType: kusamaRegistry.createType.bind(kusamaRegistry),
	rpc: {
		chain: {
			getBlockHash: promiseBlockHash,
			getHeader: promiseHeader,
		},
	},
};

const MockController = class MockController extends AbstractController {
	protected initRoutes(): void {
		throw new Error('Method not implemented.');
	}
};
const controller = new MockController((api as unknown) as ApiPromise, '/mock');

describe('getHashForBlock', () => {
	it('throws BadRequest on a 64 char hex string (too short)', async () => {
		const hex64char =
			'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b7';
		expect(hex64char.length).toBe(64);
		expect(hex64char).toMatch(/^0x[a-fA-F0-9]+$/); // check that chars are valid for a hex string

		await expect(controller['getHashForBlock'](hex64char)).rejects.toEqual(
			new BadRequest(
				`Cannot get block hash for ${hex64char}. ` +
					`Hex string block IDs must be 32-bytes (66-characters) in length.`
			)
		);
	});

	it('throws BadRequest on a 30 char hex string (too short)', async () => {
		const hex30char = '0xd6243cce33272e9fc51a9c83c2ee';
		expect(hex30char.length).toBe(30);
		expect(hex30char).toMatch(/^0x[a-fA-F0-9]+$/);

		await expect(controller['getHashForBlock'](hex30char)).rejects.toEqual(
			new BadRequest(
				`Cannot get block hash for ${hex30char}. ` +
					`Hex string block IDs must be 32-bytes (66-characters) in length.`
			)
		);
	});

	it('throws BadRequest on a 29 char hex string (too short, odd length)', async () => {
		const hex29char = '0xd6243cce33272e9fc51a9c83c2e';
		expect(hex29char.length).toBe(29);
		expect(hex29char).toMatch(/^0x[a-fA-F0-9]+$/);

		await expect(controller['getHashForBlock'](hex29char)).rejects.toEqual(
			new BadRequest(
				`Cannot get block hash for ${hex29char}. ` +
					`Hex string block IDs must be a valid hex string ` +
					`and must be 32-bytes (66-characters) in length.`
			)
		);
	});

	it('throws BadRequest on a hex string that 68 char hex string (too long)', async () => {
		const hex68char =
			'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b72411';
		expect(hex68char.length).toBe(68);
		expect(hex68char).toMatch(/^0x[a-fA-F0-9]+$/);

		await expect(controller['getHashForBlock'](hex68char)).rejects.toEqual(
			new BadRequest(
				`Cannot get block hash for ${hex68char}. ` +
					`Hex string block IDs must be 32-bytes (66-characters) in length.`
			)
		);
	});

	it('throws BadRequest on a hex string that 67 char hex string (too long, odd length)', async () => {
		const hex67char =
			'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b7241';
		expect(hex67char.length).toBe(67);
		expect(hex67char).toMatch(/^0x[a-fA-F0-9]+$/);

		await expect(controller['getHashForBlock'](hex67char)).rejects.toEqual(
			new BadRequest(
				`Cannot get block hash for ${hex67char}. ` +
					`Hex string block IDs must be a valid hex string ` +
					`and must be 32-bytes (66-characters) in length.`
			)
		);
	});

	it('throws BadRequest on negative integers', async () => {
		await expect(controller['getHashForBlock']('-1')).rejects.toEqual(
			new BadRequest(
				`Cannot get block hash for -1. ` +
					`Block IDs must be either 32-byte hex strings or non-negative decimal integers.`
			)
		);
	});

	it('throws BadRequest on a block number that is too high', async () => {
		await expect(controller['getHashForBlock']('101')).rejects.toEqual(
			new BadRequest(
				`Specified block number is larger than the current largest block. ` +
					`The largest known block number is ${'100'}.`
			)
		);
	});

	it('throws BadRequest on a hex string that has invalid characters', async () => {
		const hex66char =
			'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b72g';
		expect(hex66char).not.toMatch(/^0x[a-fA-F0-9]+$/);
		expect(hex66char.length).toBe(66);

		await expect(controller['getHashForBlock'](hex66char)).rejects.toEqual(
			new BadRequest(
				`Cannot get block hash for ${hex66char}. ` +
					`Hex string block IDs must be a valid hex string ` +
					`and must be 32-bytes (66-characters) in length.`
			)
		);
	});

	it('throws BadRequest on non-hex and non-numbers', async () => {
		await expect(
			controller['getHashForBlock']('abc')
		).rejects.toStrictEqual(
			new BadRequest(
				`Cannot get block hash for ${'abc'}. ` +
					`Block IDs must be either 32-byte hex strings or non-negative decimal integers.`
			)
		);
	});

	it('creates a BlockHash for a valid hex string', async () => {
		const valid =
			'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724';
		expect(valid).toMatch(/^0x[a-fA-F0-9]+$/);
		expect(valid.length).toBe(66);

		await expect(
			controller['getHashForBlock'](valid)
		).resolves.toStrictEqual(
			kusamaRegistry.createType(
				'BlockHash',
				'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724'
			)
		);
	});

	it('creates a BlockHash for an integer less than the current block height', async () => {
		await expect(
			controller['getHashForBlock']('99')
		).resolves.toStrictEqual(
			kusamaRegistry.createType(
				'BlockHash',
				'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724'
			)
		);
	});

	it('throws InternalServerError when getHeader() throws', async () => {
		api.rpc.chain.getHeader = () =>
			Promise.resolve().then(() => {
				throw 'dummy getHeader error';
			});

		const mock = new MockController(api as ApiPromise, '/mock');
		await expect(mock['getHashForBlock']('101')).rejects.toEqual(
			new InternalServerError(
				'Failed while trying to get the latests header.'
			)
		);

		api.rpc.chain.getHeader = promiseHeader;
	});

	it('throws InternalServerError when getBlockHash throws', async () => {
		api.rpc.chain.getBlockHash = (_n: number) =>
			Promise.resolve().then(() => {
				throw 'dummy getBlockHash error';
			});

		const mock = new MockController(api as ApiPromise, '/mock');
		await expect(mock['getHashForBlock']('99')).rejects.toEqual(
			new InternalServerError(`Cannot get block hash for ${'99'}.`)
		);

		api.rpc.chain.getBlockHash = promiseBlockHash;
	});

	it('throws InternalServerError when createType throws', async () => {
		api.createType = (_type: string, _value: string) => {
			throw 'dummy createType error';
		};
		const valid =
			'0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724';
		expect(valid).toMatch(/^0x[a-fA-F0-9]+$/);
		expect(valid.length).toBe(66);
		expect(api.createType).toThrow('dummy createType error');
		const mock = new MockController(api as ApiPromise, '/mock');

		await expect(mock['getHashForBlock'](valid)).rejects.toEqual(
			new InternalServerError(`Cannot get block hash for ${valid}.`)
		);

		api.createType = kusamaRegistry.createType.bind(kusamaRegistry);
	});
});
