// Copyright 2017-2026 Parity Technologies (UK) Ltd.
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

import type { ApiPromise } from '@polkadot/api';
import { ApiDecoration } from '@polkadot/api/types';
import type { Hash } from '@polkadot/types/interfaces';
import { BadRequest } from 'http-errors';

import { polkadotMetadataRpcV1003000 } from '../../test-helpers/metadata/polkadotV1003000Metadata';
import { polkadotRegistryV1003000 } from '../../test-helpers/registries';
import { blockHash22887036 } from '../test-helpers/mock';
import { TransactionMetadataBlobService } from './TransactionMetadataBlobService';

// Mock the merkleize-metadata functions
const mockDigest = jest.fn().mockReturnValue(
	new Uint8Array([
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
		32,
	]),
);
const mockGetProofForExtrinsic = jest.fn().mockReturnValue(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
const mockGetProofForExtrinsicParts = jest.fn().mockReturnValue(new Uint8Array([0xca, 0xfe, 0xba, 0xbe]));

const mockMerkleized = {
	digest: mockDigest,
	getProofForExtrinsic: mockGetProofForExtrinsic,
	getProofForExtrinsicParts: mockGetProofForExtrinsicParts,
};

const mockMerkleizeMetadata = jest.fn().mockReturnValue(mockMerkleized);

// Mock metadata functions
const mockMetadataAtVersion = () =>
	Promise.resolve().then(() => {
		return polkadotRegistryV1003000.createType('Option<OpaqueMetadata>', polkadotMetadataRpcV1003000);
	});

const mockMetadataVersions = jest.fn().mockResolvedValue({
	toJSON: jest.fn().mockReturnValue([14, 15]),
});

const mockMetadataVersionsNoV15 = jest.fn().mockResolvedValue({
	toJSON: jest.fn().mockReturnValue([14]),
});

const mockHeader = {
	number: {
		unwrap: () => ({
			toString: () => '22887036',
		}),
	},
};

const runtimeVersion = {
	specName: polkadotRegistryV1003000.createType('Text', 'polkadot'),
	specVersion: polkadotRegistryV1003000.createType('u32', 1003000),
	transactionVersion: polkadotRegistryV1003000.createType('u32', 26),
};

const mockProperties = {
	ss58Format: {
		isSome: true,
		value: {
			toNumber: () => 0,
		},
	},
	tokenDecimals: {
		isSome: true,
		value: {
			toJSON: () => 10,
		},
	},
	tokenSymbol: {
		isSome: true,
		value: {
			toJSON: () => 'DOT',
		},
	},
};

const mockHistoricApi = {
	call: {
		metadata: {
			metadataVersions: mockMetadataVersions,
			metadataAtVersion: mockMetadataAtVersion,
		},
	},
	registry: polkadotRegistryV1003000,
} as unknown as ApiDecoration<'promise'>;

const mockApi = {
	...mockHistoricApi,
	rpc: {
		chain: {
			getHeader: () => Promise.resolve(mockHeader),
		},
		state: {
			getRuntimeVersion: () => Promise.resolve(runtimeVersion),
		},
		system: {
			properties: () => Promise.resolve(mockProperties),
		},
	},
	at: (_hash: Hash) => Promise.resolve(mockHistoricApi),
} as unknown as ApiPromise;

describe('TransactionMetadataBlobService', () => {
	let getMerkleizeMetadataSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		// Mock the getMerkleizeMetadata method on the prototype to return our mock
		getMerkleizeMetadataSpy = jest
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.spyOn(TransactionMetadataBlobService.prototype as any, 'getMerkleizeMetadata')
			.mockResolvedValue(mockMerkleizeMetadata);
	});

	afterEach(() => {
		getMerkleizeMetadataSpy.mockRestore();
	});

	describe('fetchMetadataBlob', () => {
		it('should return metadata blob when given a full extrinsic (tx)', async () => {
			const service = new TransactionMetadataBlobService('mock');
			// timestamp.set()
			const tx = '0x280403000b207eba5c8501';

			const result = await service.fetchMetadataBlob(mockApi, blockHash22887036, { tx });

			expect(result.at.hash).toEqual(blockHash22887036);
			expect(result.at.height).toEqual('22887036');
			expect(result.metadataHash).toMatch(/^0x[a-f0-9]{64}$/);
			expect(result.metadataBlob).toMatch(/^0x[a-f0-9]+$/);
			expect(result.specVersion).toEqual(1003000);
			expect(result.specName).toEqual('polkadot');
			expect(result.base58Prefix).toEqual(0);
			expect(result.decimals).toEqual(10);
			expect(result.tokenSymbol).toEqual('DOT');
			expect(mockGetProofForExtrinsic).toHaveBeenCalledWith(tx, undefined);
		});

		it('should return metadata blob when given extrinsic parts', async () => {
			const service = new TransactionMetadataBlobService('mock');
			const params = {
				callData: '0x0403',
				includedInExtrinsic: '0x00',
				includedInSignedData: '0x00',
			};

			const result = await service.fetchMetadataBlob(mockApi, blockHash22887036, params);

			expect(result.at.hash).toEqual(blockHash22887036);
			expect(result.metadataBlob).toMatch(/^0x[a-f0-9]+$/);
			expect(mockGetProofForExtrinsicParts).toHaveBeenCalledWith(
				params.callData,
				params.includedInExtrinsic,
				params.includedInSignedData,
			);
		});

		it('should use txAdditionalSigned when provided with tx', async () => {
			const service = new TransactionMetadataBlobService('mock');
			// timestamp.set()
			const tx = '0x280403000b207eba5c8501';
			const txAdditionalSigned = '0x1234';

			await service.fetchMetadataBlob(mockApi, blockHash22887036, { tx, txAdditionalSigned });

			expect(mockGetProofForExtrinsic).toHaveBeenCalledWith(tx, txAdditionalSigned);
		});

		it('should throw BadRequest when neither tx nor callData is provided', async () => {
			const service = new TransactionMetadataBlobService('mock');

			await expect(service.fetchMetadataBlob(mockApi, blockHash22887036, {})).rejects.toThrow(BadRequest);
			await expect(service.fetchMetadataBlob(mockApi, blockHash22887036, {})).rejects.toThrow(
				'Must provide either `tx` (full extrinsic) or `callData` with `includedInExtrinsic` and `includedInSignedData`.',
			);
		});

		it('should throw BadRequest when callData is provided without includedInExtrinsic', async () => {
			const service = new TransactionMetadataBlobService('mock');
			const params = {
				callData: '0x0403',
				includedInSignedData: '0x00',
			};

			await expect(service.fetchMetadataBlob(mockApi, blockHash22887036, params)).rejects.toThrow(BadRequest);
			await expect(service.fetchMetadataBlob(mockApi, blockHash22887036, params)).rejects.toThrow(
				'When using `callData`, must also provide `includedInExtrinsic` and `includedInSignedData`.',
			);
		});

		it('should throw BadRequest when callData is provided without includedInSignedData', async () => {
			const service = new TransactionMetadataBlobService('mock');
			const params = {
				callData: '0x0403',
				includedInExtrinsic: '0x00',
			};

			await expect(service.fetchMetadataBlob(mockApi, blockHash22887036, params)).rejects.toThrow(BadRequest);
			await expect(service.fetchMetadataBlob(mockApi, blockHash22887036, params)).rejects.toThrow(
				'When using `callData`, must also provide `includedInExtrinsic` and `includedInSignedData`.',
			);
		});

		it('should throw BadRequest when V15 metadata is not available', async () => {
			const mockHistoricApiNoV15 = {
				call: {
					metadata: {
						metadataVersions: mockMetadataVersionsNoV15,
						metadataAtVersion: mockMetadataAtVersion,
					},
				},
				registry: polkadotRegistryV1003000,
			} as unknown as ApiDecoration<'promise'>;

			const mockApiNoV15 = {
				...mockApi,
				at: (_hash: Hash) => Promise.resolve(mockHistoricApiNoV15),
			} as unknown as ApiPromise;

			const service = new TransactionMetadataBlobService('mock');
			const tx = '0x280403000b207eba5c8501';

			await expect(service.fetchMetadataBlob(mockApiNoV15, blockHash22887036, { tx })).rejects.toThrow(BadRequest);
			await expect(service.fetchMetadataBlob(mockApiNoV15, blockHash22887036, { tx })).rejects.toThrow(
				'Metadata V15 is not available on this chain. CheckMetadataHash requires V15 metadata.',
			);
		});

		it('should handle array token decimals and symbols', async () => {
			const mockPropertiesArray = {
				ss58Format: {
					isSome: true,
					value: {
						toNumber: () => 2,
					},
				},
				tokenDecimals: {
					isSome: true,
					value: {
						toJSON: () => [12, 10],
					},
				},
				tokenSymbol: {
					isSome: true,
					value: {
						toJSON: () => ['KSM', 'DOT'],
					},
				},
			};

			const mockApiArray = {
				...mockApi,
				rpc: {
					...mockApi.rpc,
					system: {
						properties: () => Promise.resolve(mockPropertiesArray),
					},
				},
			} as unknown as ApiPromise;

			const service = new TransactionMetadataBlobService('mock');
			const tx = '0x280403000b207eba5c8501';

			const result = await service.fetchMetadataBlob(mockApiArray, blockHash22887036, { tx });

			expect(result.decimals).toEqual(12);
			expect(result.tokenSymbol).toEqual('KSM');
			expect(result.base58Prefix).toEqual(2);
		});

		it('should use default values when properties are not available', async () => {
			const mockPropertiesEmpty = {
				ss58Format: {
					isSome: false,
				},
				tokenDecimals: {
					isSome: false,
				},
				tokenSymbol: {
					isSome: false,
				},
			};

			const mockApiEmpty = {
				...mockApi,
				rpc: {
					...mockApi.rpc,
					system: {
						properties: () => Promise.resolve(mockPropertiesEmpty),
					},
				},
			} as unknown as ApiPromise;

			const service = new TransactionMetadataBlobService('mock');
			const tx = '0x280403000b207eba5c8501';

			const result = await service.fetchMetadataBlob(mockApiEmpty, blockHash22887036, { tx });

			expect(result.decimals).toEqual(10);
			expect(result.tokenSymbol).toEqual('DOT');
			expect(result.base58Prefix).toEqual(42);
		});

		it('should call merkleizeMetadata with correct parameters', async () => {
			const service = new TransactionMetadataBlobService('mock');
			const tx = '0x280403000b207eba5c8501';

			await service.fetchMetadataBlob(mockApi, blockHash22887036, { tx });

			expect(mockMerkleizeMetadata).toHaveBeenCalledWith(expect.any(Uint8Array), { decimals: 10, tokenSymbol: 'DOT' });
		});
	});
});
