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
import { GenericExtrinsic } from '@polkadot/types';
import { AccountId, Block, Extrinsic, Hash, RuntimeDispatchInfo } from '@polkadot/types/interfaces';

import { coretimeKusamaMetadataV1003003M } from '../../../test-helpers/metadata/metadata';
import { coretimeKusamaRegistryV1003003 } from '../../../test-helpers/registries/coretimeChainKusamaRegistry';
import { balancesTransferKeepAliveValid, blockHash789629 } from '.';
import { mockBlock26187139 } from './mockBlock26187139';

export const getBlock26187139 = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return {
			block: mockBlock26187139,
		};
	});

export const deriveGetBlock26187139 = (_hash: Hash): Promise<{ block: Block; author: AccountId }> =>
	Promise.resolve().then(() => {
		return {
			author: coretimeKusamaRegistryV1003003.createType('AccountId', '1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'),
			block: mockBlock26187139,
		};
	});

const getHeader = (_hash: Hash) => Promise.resolve().then(() => mockBlock26187139.header);

const runtimeVersion = {
	specName: coretimeKusamaRegistryV1003003.createType('Text', 'coretime-kusama'),
	specVersion: coretimeKusamaRegistryV1003003.createType('u32', 1003003),
	transactionVersion: coretimeKusamaRegistryV1003003.createType('u32', 1),
	implVersion: coretimeKusamaRegistryV1003003.createType('u32', 0),
	implName: coretimeKusamaRegistryV1003003.createType('Text', 'coretime-kusama'),
	authoringVersion: coretimeKusamaRegistryV1003003.createType('u32', 1),
};

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return runtimeVersion;
	});

const getMetadata = () => Promise.resolve().then(() => coretimeKusamaMetadataV1003003M);

// For getting the blockhash of the genesis block
const getBlockHashGenesis = (_zero: number) =>
	Promise.resolve().then(() =>
		coretimeKusamaRegistryV1003003.createType(
			'BlockHash',
			'0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
		),
	);

const runtimeDispatchInfo = coretimeKusamaRegistryV1003003.createType('RuntimeDispatchInfo', {
	weight: {
		refTime: '145570000',
		proofSize: '3593',
	},
	class: 'Normal',
	partialFee: '159154905',
});

export const queryInfoCall22887036 = (
	_extrinsic: GenericExtrinsic,
	_length: Uint8Array,
): Promise<RuntimeDispatchInfo> => Promise.resolve().then(() => runtimeDispatchInfo);

export const queryInfoAt22887036 = (_extrinsic: string, _hash: Hash): Promise<RuntimeDispatchInfo> =>
	Promise.resolve().then(() => runtimeDispatchInfo);

export const submitExtrinsic22887036 = (_extrinsic: string): Promise<Hash> =>
	Promise.resolve().then(() => coretimeKusamaRegistryV1003003.createType('Hash'));

const getStorage = () => Promise.resolve().then(() => coretimeKusamaRegistryV1003003.createType('Option<Raw>', '0x00'));

const getFinalizedHead = () => Promise.resolve().then(() => blockHash789629);

export const tx22887036 = (): Extrinsic =>
	coretimeKusamaRegistryV1003003.createType('Extrinsic', balancesTransferKeepAliveValid);

/**
 * Minimal mock polkadot-js ApiPromise. Values are largely meant to be accurate for block
 * #22887036, which is what most Service unit tests are based on.
 */
export const mockKusamaCoretimeApiBlock26187139 = {
	runtimeVersion,
	call: {
		transactionPaymentApi: {
			queryInfo: queryInfoCall22887036,
		},
	},
	createType: coretimeKusamaRegistryV1003003.createType.bind(coretimeKusamaRegistryV1003003),
	registry: coretimeKusamaRegistryV1003003,
	rpc: {
		chain: {
			getHeader,
			getBlock26187139,
			getBlockHash: getBlockHashGenesis,
			getFinalizedHead,
		},
		state: {
			getRuntimeVersion,
			getMetadata,
			getStorage,
		},
		payment: {
			queryInfo: queryInfoAt22887036,
		},
		author: {
			submitExtrinsic22887036,
		},
	},
} as unknown as ApiPromise;
