// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiPromise } from '@polkadot/api';
import { Compact } from '@polkadot/types';
import { BlockHash, BlockNumber } from '@polkadot/types/interfaces';
import { Request, Response } from 'express';
import { BadRequest, InternalServerError } from 'http-errors';

import { AbstractService } from '../services/AbstractService';
import { kusamaRegistry } from '../test-helpers/registries';
import AbstractController from './AbstractController';

const promiseBlockHash = (num: number): Promise<BlockHash> =>
	new Promise((resolve, reject) => {
		if (num > 100) {
			reject();
		} else {
			resolve(
				kusamaRegistry.createType('BlockHash', '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724'),
			);
		}
	});

const promiseHeader = (): Promise<{ number: Compact<BlockNumber> }> =>
	Promise.resolve().then(() => {
		return {
			number: kusamaRegistry.createType('Compact<BlockNumber>', 100),
		};
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MockController = class MockController extends AbstractController<AbstractService> {
	protected initRoutes(): void {
		throw new Error('Method not implemented.');
	}
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MockService = new (class MockService extends AbstractService {})(api as unknown as ApiPromise);

const controller = new MockController(api as unknown as ApiPromise, '/mock', MockService);

// Mock arguments for Express RequestHandler
const req = 'req' as unknown as Request;
const res = 'res' as unknown as Response;

describe('AbstractController', () => {
	describe('catchWrap', () => {
		it('catches throw from an async function and calls next with error', async () => {
			const next = jest.fn();
			const throws = () =>
				Promise.resolve().then(() => {
					throw 'Throwing';
				});

			await expect(
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				AbstractController['catchWrap'](throws)(req, res, next),
			).resolves.toBe(undefined);
			expect(next).toBeCalledTimes(1);
			expect(next).toBeCalledWith('Throwing');
		});

		it('catches throw from a synchronous functions and calls next with error', async () => {
			// catchWrap does not need to be used with a synchronous RequestHandler,
			// because Express will catch synchronous errors, but we make sure it works
			// just in case it is misused.
			const next = jest.fn();
			const throws = () => {
				throw 'Throwing';
			};

			await expect(
				// eslint-disable-next-line @typescript-eslint/await-thenable
				AbstractController['catchWrap'](throws)(req, res, next),
			).resolves.toBe(undefined);
			expect(next).toBeCalledTimes(1);
			expect(next).toBeCalledWith('Throwing');
		});

		it('handles a successful async callback appropriately', async () => {
			const next = jest.fn();
			const success = () => Promise.resolve().then(() => 'Great success!');

			await expect(
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				AbstractController['catchWrap'](success)(req, res, next),
			).resolves.toBe(undefined);
			expect(next).not.toBeCalled();
		});

		it('handles a successful synchronous callback appropriately', async () => {
			const next = jest.fn();
			const success = () => 'Great success!';

			await expect(AbstractController['catchWrap'](success)(req, res, next)).resolves.toBe(undefined);
			expect(next).not.toBeCalled();
		});
	});

	describe('getHashForBlock', () => {
		it('throws BadRequest on a 64 char hex string (too short)', async () => {
			const hex64char = '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b7';
			expect(hex64char.length).toBe(64);
			expect(hex64char).toMatch(/^0x[a-fA-F0-9]+$/); // check that chars are valid for a hex string

			await expect(controller['getHashForBlock'](hex64char)).rejects.toEqual(
				new BadRequest(
					`Cannot get block hash for ${hex64char}. ` +
						`Hex string block IDs must be 32-bytes (66-characters) in length.`,
				),
			);
		});

		it('throws BadRequest on a 30 char hex string (too short)', async () => {
			const hex30char = '0xd6243cce33272e9fc51a9c83c2ee';
			expect(hex30char.length).toBe(30);
			expect(hex30char).toMatch(/^0x[a-fA-F0-9]+$/);

			await expect(controller['getHashForBlock'](hex30char)).rejects.toEqual(
				new BadRequest(
					`Cannot get block hash for ${hex30char}. ` +
						`Hex string block IDs must be 32-bytes (66-characters) in length.`,
				),
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
						`and must be 32-bytes (66-characters) in length.`,
				),
			);
		});

		it('throws BadRequest on a 68 char hex string (too long)', async () => {
			const hex68char = '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b72411';
			expect(hex68char.length).toBe(68);
			expect(hex68char).toMatch(/^0x[a-fA-F0-9]+$/);

			await expect(controller['getHashForBlock'](hex68char)).rejects.toEqual(
				new BadRequest(
					`Cannot get block hash for ${hex68char}. ` +
						`Hex string block IDs must be 32-bytes (66-characters) in length.`,
				),
			);
		});

		it('throws BadRequest on a 67 char hex string (too long, odd length)', async () => {
			const hex67char = '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b7241';
			expect(hex67char.length).toBe(67);
			expect(hex67char).toMatch(/^0x[a-fA-F0-9]+$/);

			await expect(controller['getHashForBlock'](hex67char)).rejects.toEqual(
				new BadRequest(
					`Cannot get block hash for ${hex67char}. ` +
						`Hex string block IDs must be a valid hex string ` +
						`and must be 32-bytes (66-characters) in length.`,
				),
			);
		});

		it('throws BadRequest on negative integers', async () => {
			await expect(controller['getHashForBlock']('-1')).rejects.toEqual(
				new BadRequest(
					`Cannot get block hash for -1. ` +
						`Block IDs must be either 32-byte hex strings or non-negative decimal integers.`,
				),
			);
		});

		it('throws BadRequest on a block number that is too high', async () => {
			await expect(controller['getHashForBlock']('101')).rejects.toEqual(
				new BadRequest(
					`Specified block number is larger than the current largest block. ` +
						`The largest known block number is ${'100'}.`,
				),
			);
		});

		it('throws BadRequest on a hex string that has invalid characters', async () => {
			const hex66char = '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b72g';
			expect(hex66char).not.toMatch(/^0x[a-fA-F0-9]+$/);
			expect(hex66char.length).toBe(66);

			await expect(controller['getHashForBlock'](hex66char)).rejects.toEqual(
				new BadRequest(
					`Cannot get block hash for ${hex66char}. ` +
						`Hex string block IDs must be a valid hex string ` +
						`and must be 32-bytes (66-characters) in length.`,
				),
			);
		});

		it('throws BadRequest on non-hex and non-numbers', async () => {
			await expect(controller['getHashForBlock']('abc')).rejects.toStrictEqual(
				new BadRequest(
					`Cannot get block hash for ${'abc'}. ` +
						`Block IDs must be either 32-byte hex strings or non-negative decimal integers.`,
				),
			);
		});

		it('creates a BlockHash for a valid hex string', async () => {
			const valid = '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724';
			expect(valid).toMatch(/^0x[a-fA-F0-9]+$/);
			expect(valid.length).toBe(66);

			await expect(controller['getHashForBlock'](valid)).resolves.toStrictEqual(
				kusamaRegistry.createType('BlockHash', '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724'),
			);
		});

		it('creates a BlockHash for an integer less than the current block height', async () => {
			await expect(controller['getHashForBlock']('99')).resolves.toStrictEqual(
				kusamaRegistry.createType('BlockHash', '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724'),
			);
		});

		it('throws InternalServerError when getHeader() throws', async () => {
			api.rpc.chain.getHeader = () =>
				Promise.resolve().then(() => {
					throw 'dummy getHeader error';
				});

			const mock = new MockController(api as ApiPromise, '/mock', MockService);
			// We only try api.rpc.chain.getHeader when the block number is too high
			await expect(mock['getHashForBlock']('101')).rejects.toEqual(
				new InternalServerError('Failed while trying to get the latest header.'),
			);

			api.rpc.chain.getHeader = promiseHeader;
		});

		it('throws InternalServerError when getBlockHash() throws', async () => {
			api.rpc.chain.getBlockHash = (_n: number) =>
				Promise.resolve().then(() => {
					throw 'dummy getBlockHash error';
				});

			const mock = new MockController(api as ApiPromise, '/mock', MockService);
			await expect(mock['getHashForBlock']('99')).rejects.toEqual(
				new InternalServerError(`Cannot get block hash for ${'99'}.`),
			);

			api.rpc.chain.getBlockHash = promiseBlockHash;
		});

		it('throws InternalServerError when createType() throws', async () => {
			api.createType = (_type: string, _value: string) => {
				throw 'dummy createType error';
			};
			const valid = '0xd6243cce33272e9fc51a9c83c2ee80e795a73ac03cf1d9b03f1d880852c1b724';
			expect(valid).toMatch(/^0x[a-fA-F0-9]+$/);
			expect(valid.length).toBe(66);
			expect(api.createType).toThrow('dummy createType error');
			const mock = new MockController(api as ApiPromise, '/mock', MockService);

			await expect(mock['getHashForBlock'](valid)).rejects.toEqual(
				new InternalServerError(`Cannot get block hash for ${valid}.`),
			);

			api.createType = kusamaRegistry.createType.bind(kusamaRegistry);
		});
	});

	describe('parseRangeOfNumbersOrThrow', () => {
		it('Should return the correct array given a range', () => {
			const res = controller['parseRangeOfNumbersOrThrow']('100-103', 500);

			expect(res).toStrictEqual([100, 101, 102, 103]);
		});

		it('Should throw an error when the inputted format is wrong', () => {
			const badFormatRequest = new BadRequest('Incorrect range format. Expected example: 0-999');
			const badMinRequest = new BadRequest('Inputted min value for range must be an unsigned integer.');
			const badMaxRequest = new BadRequest('Inputted max value for range must be an unsigned non zero integer.');
			const badMaxMinRequest = new BadRequest('Inputted min value cannot be greater than or equal to the max value.');
			const badMaxRangeRequest = new BadRequest('Inputted range is greater than the 500 range limit.');
			expect(() => controller['parseRangeOfNumbersOrThrow']('100', 500)).toThrow(badFormatRequest);
			expect(() => controller['parseRangeOfNumbersOrThrow']('h-100', 500)).toThrow(badMinRequest);
			expect(() => controller['parseRangeOfNumbersOrThrow']('100-h', 500)).toThrow(badMaxRequest);
			expect(() => controller['parseRangeOfNumbersOrThrow']('100-1', 500)).toThrow(badMaxMinRequest);
			expect(() => controller['parseRangeOfNumbersOrThrow']('1-1', 500)).toThrow(badMaxMinRequest);
			expect(() => controller['parseRangeOfNumbersOrThrow']('2-503', 500)).toThrow(badMaxRangeRequest);
		});
	});
});
