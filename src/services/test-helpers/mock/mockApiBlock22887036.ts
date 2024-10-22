// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { polkadotMetadata } from '../../../test-helpers/metadata/metadata';
import { polkadotRegistryV1003000 } from '../../../test-helpers/registries';
import { balancesTransferKeepAliveValid, blockHash789629, mockBlock789629 } from '.';

export const getBlock22887036 = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return {
			block: mockBlock789629,
		};
	});

export const deriveGetBlock22887036 = (_hash: Hash): Promise<{ block: Block; author: AccountId }> =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistryV1003000.createType('AccountId', '1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'),
			block: mockBlock789629,
		};
	});

const getHeader = (_hash: Hash) => Promise.resolve().then(() => mockBlock789629.header);

const runtimeVersion = {
	specName: polkadotRegistryV1003000.createType('Text', 'polkadot'),
	specVersion: polkadotRegistryV1003000.createType('u32', 16),
	transactionVersion: polkadotRegistryV1003000.createType('u32', 2),
	implVersion: polkadotRegistryV1003000.createType('u32', 0),
	implName: polkadotRegistryV1003000.createType('Text', 'parity-polkadot'),
	authoringVersion: polkadotRegistryV1003000.createType('u32', 0),
};

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return runtimeVersion;
	});

const getMetadata = () => Promise.resolve().then(() => polkadotMetadata);

// For getting the blockhash of the genesis block
const getBlockHashGenesis = (_zero: number) =>
	Promise.resolve().then(() =>
		polkadotRegistryV1003000.createType(
			'BlockHash',
			'0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
		),
	);

const runtimeDispatchInfo = polkadotRegistryV1003000.createType('RuntimeDispatchInfo', {
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
	Promise.resolve().then(() => polkadotRegistryV1003000.createType('Hash'));

const getStorage = () => Promise.resolve().then(() => polkadotRegistryV1003000.createType('Option<Raw>', '0x00'));

const getFinalizedHead = () => Promise.resolve().then(() => blockHash789629);

export const tx22887036 = (): Extrinsic =>
	polkadotRegistryV1003000.createType('Extrinsic', balancesTransferKeepAliveValid);

/**
 * Minimal mock polkadot-js ApiPromise. Values are largely meant to be accurate for block
 * #22887036, which is what most Service unit tests are based on.
 */
export const mockApiBlock22887036 = {
	runtimeVersion,
	call: {
		transactionPaymentApi: {
			queryInfo: queryInfoCall22887036,
		},
	},
	createType: polkadotRegistryV1003000.createType.bind(polkadotRegistryV1003000),
	registry: polkadotRegistryV1003000,
	rpc: {
		chain: {
			getHeader,
			getBlock22887036,
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
