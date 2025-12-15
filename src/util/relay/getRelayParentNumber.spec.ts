// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';

import { polkadotRegistry } from '../../test-helpers/registries';
import { getRelayParentNumber, hasRelayParentData } from './getRelayParentNumber';

const mockBlockHash = polkadotRegistry.createType(
	'BlockHash',
	'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578',
);

const mockRelayParentNumber = 28500000;

/**
 * Create a mock extrinsic that simulates setValidationData
 */
const createMockSetValidationDataExtrinsic = () => ({
	method: {
		method: {
			toString: () => 'setValidationData',
		},
	},
});

/**
 * Create a mock extrinsic that is NOT setValidationData
 */
const createMockOtherExtrinsic = (methodName: string) => ({
	method: {
		method: {
			toString: () => methodName,
		},
	},
});

/**
 * Create a mock registry.createType that returns the expected structure
 */
const createMockCreateType = (relayParentNumber: number) => {
	return (_typeName: string, _data: unknown) => ({
		toJSON: () => ({
			args: {
				data: {
					validationData: {
						relayParentNumber,
					},
				},
			},
		}),
	});
};

describe('getRelayParentNumber', () => {
	describe('getRelayParentNumber', () => {
		it('should extract relay parent number from a parachain block', async () => {
			const mockApiAt = {
				registry: {
					createType: createMockCreateType(mockRelayParentNumber),
				},
			};

			const mockAt = jest.fn().mockResolvedValue(mockApiAt);
			const mockGetBlock = jest.fn().mockResolvedValue({
				block: {
					extrinsics: [
						createMockOtherExtrinsic('timestamp'),
						createMockSetValidationDataExtrinsic(),
						createMockOtherExtrinsic('transfer'),
					],
				},
			});

			const mockApi = {
				at: mockAt,
				rpc: {
					chain: {
						getBlock: mockGetBlock,
					},
				},
			} as unknown as ApiPromise;

			const result = await getRelayParentNumber(mockApi, mockBlockHash);

			expect(result).toBeInstanceOf(BN);
			expect(result.toNumber()).toBe(mockRelayParentNumber);
			expect(mockAt).toHaveBeenCalledWith(mockBlockHash);
			expect(mockGetBlock).toHaveBeenCalledWith(mockBlockHash);
		});

		it('should throw error when setValidationData extrinsic is not found', async () => {
			const mockApi = {
				at: jest.fn().mockResolvedValue({}),
				rpc: {
					chain: {
						getBlock: jest.fn().mockResolvedValue({
							block: {
								extrinsics: [createMockOtherExtrinsic('timestamp'), createMockOtherExtrinsic('transfer')],
							},
						}),
					},
				},
			} as unknown as ApiPromise;

			await expect(getRelayParentNumber(mockApi, mockBlockHash)).rejects.toThrow(
				'Block does not contain setValidationData extrinsic. Cannot determine relay parent number.',
			);
		});

		it('should handle block with only setValidationData extrinsic', async () => {
			const mockApiAt = {
				registry: {
					createType: createMockCreateType(12345678),
				},
			};

			const mockApi = {
				at: jest.fn().mockResolvedValue(mockApiAt),
				rpc: {
					chain: {
						getBlock: jest.fn().mockResolvedValue({
							block: {
								extrinsics: [createMockSetValidationDataExtrinsic()],
							},
						}),
					},
				},
			} as unknown as ApiPromise;

			const result = await getRelayParentNumber(mockApi, mockBlockHash);

			expect(result.toNumber()).toBe(12345678);
		});

		it('should handle large relay parent numbers', async () => {
			const largeBlockNumber = 999999999;
			const mockApiAt = {
				registry: {
					createType: createMockCreateType(largeBlockNumber),
				},
			};

			const mockApi = {
				at: jest.fn().mockResolvedValue(mockApiAt),
				rpc: {
					chain: {
						getBlock: jest.fn().mockResolvedValue({
							block: {
								extrinsics: [createMockSetValidationDataExtrinsic()],
							},
						}),
					},
				},
			} as unknown as ApiPromise;

			const result = await getRelayParentNumber(mockApi, mockBlockHash);

			expect(result.toNumber()).toBe(largeBlockNumber);
		});
	});

	describe('hasRelayParentData', () => {
		it('should return true when block contains setValidationData', async () => {
			const mockApi = {
				rpc: {
					chain: {
						getBlock: jest.fn().mockResolvedValue({
							block: {
								extrinsics: [createMockOtherExtrinsic('timestamp'), createMockSetValidationDataExtrinsic()],
							},
						}),
					},
				},
			} as unknown as ApiPromise;

			const result = await hasRelayParentData(mockApi, mockBlockHash);

			expect(result).toBe(true);
		});

		it('should return false when block does not contain setValidationData', async () => {
			const mockApi = {
				rpc: {
					chain: {
						getBlock: jest.fn().mockResolvedValue({
							block: {
								extrinsics: [createMockOtherExtrinsic('timestamp'), createMockOtherExtrinsic('transfer')],
							},
						}),
					},
				},
			} as unknown as ApiPromise;

			const result = await hasRelayParentData(mockApi, mockBlockHash);

			expect(result).toBe(false);
		});

		it('should return false for empty extrinsics array', async () => {
			const mockApi = {
				rpc: {
					chain: {
						getBlock: jest.fn().mockResolvedValue({
							block: {
								extrinsics: [],
							},
						}),
					},
				},
			} as unknown as ApiPromise;

			const result = await hasRelayParentData(mockApi, mockBlockHash);

			expect(result).toBe(false);
		});
	});
});
