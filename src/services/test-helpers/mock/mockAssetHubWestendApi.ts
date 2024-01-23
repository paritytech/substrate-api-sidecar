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

import type { ApiPromise } from '@polkadot/api';
import type { GenericExtrinsic, Vec } from '@polkadot/types';
import type { Option } from '@polkadot/types/codec';
import type {
	AccountId,
	ActiveEraInfo,
	Block,
	EraIndex,
	Extrinsic,
	Hash,
	RuntimeDispatchInfo,
	SessionIndex,
	StakingLedger,
} from '@polkadot/types/interfaces';
import BN from 'bn.js';

import { assetHubWestendMetadata } from '../../../test-helpers/metadata/metadata';
import { assetHubWestendRegistryV9435, kusamaRegistry } from '../../../test-helpers/registries';
import { getPalletDispatchables } from '../mock/data/mockDispatchablesData';
import { balancesTransferValid, blockHash5236177, mockBlock5236177, testAddressController } from '.';
import { localListenAddressesHex } from './data/localListenAddresses';
import { getMetadata as mockMetaData } from './data/mockNonimationPoolResponseData';
import traceBlockRPC from './data/traceBlock.json';
import { defaultMockApi } from './mockApi';

const chain = () =>
	Promise.resolve().then(() => {
		return assetHubWestendRegistryV9435.createType('Text', ['Westmint']);
	});

export const assetHubWestendGetBlock = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return {
			block: mockBlock5236177,
		};
	});

export const assetHubWestendDeriveGetBlock = (_hash: Hash): Promise<{ block: Block; author: AccountId }> =>
	Promise.resolve().then(() => {
		return {
			author: assetHubWestendRegistryV9435.createType('AccountId', ['1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK']),
			block: mockBlock5236177,
		};
	});

const getHeader = (_hash: Hash) => Promise.resolve().then(() => mockBlock5236177.header);

const runtimeVersion = {
	specName: assetHubWestendRegistryV9435.createType('Text', ['Westmint']),
	specVersion: assetHubWestendRegistryV9435.createType('u32', [16]),
	transactionVersion: assetHubWestendRegistryV9435.createType('u32', [2]),
	implVersion: assetHubWestendRegistryV9435.createType('u32', [0]),
	implName: assetHubWestendRegistryV9435.createType('Text', ['westmint']),
	authoringVersion: assetHubWestendRegistryV9435.createType('u32', [0]),
};

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return runtimeVersion;
	});

const getMetadata = () => Promise.resolve().then(() => assetHubWestendMetadata);

const deriveGetHeader = () =>
	Promise.resolve().then(() => {
		return {
			author: assetHubWestendRegistryV9435.createType('AccountId', ['1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK']),
		};
	});

const version = () =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Text', ['0.8.22-c6ee8675-x86_64-linux-gnu']));

export const assetHubWestendActiveEraAt = (_hash: Hash): Promise<Option<ActiveEraInfo>> =>
	Promise.resolve().then(() =>
		assetHubWestendRegistryV9435.createType('Option<ActiveEraInfo>', [{ index: 49 }, { start: 1595259378000 }]),
	);

export const assetHubWestendErasStartSessionIndexAt = (
	_hash: Hash,
	_activeEra: EraIndex,
): Promise<Option<SessionIndex>> =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Option<SessionIndex>', [330]));

export const assetHubWestendBondedAt = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Option<AccountId>', [testAddressController]));

export const assetHubWestendLedgerAt = (_hash: Hash, _address: string): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		assetHubWestendRegistryV9435.createType('Option<StakingLedger>', [
			'0x2c2a55b5e0d28cc772b47bb9b25981cbb69eca73f7c3388fb6464e7d24be470e0700e87648170700e8764817008c000000000100000002000000030000000400000005000000060000000700000008000000090000001700000018000000190000001a0000001b0000001c0000001d0000001e0000001f000000200000002100000022000000230000002400000025000000260000002700000028000000290000002a0000002b0000002c0000002d0000002e0000002f000000',
		]),
	);

// For getting the blockhash of the genesis block
const getBlockHashGenesis = (_zero: number) =>
	Promise.resolve().then(() =>
		assetHubWestendRegistryV9435.createType('BlockHash', [
			'0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
		]),
	);

const queryFeeDetails = () =>
	Promise.resolve().then(() => {
		const inclusionFee = assetHubWestendRegistryV9435.createType('Option<InclusionFee>', [
			{
				baseFee: 10000000,
				lenFee: 143000000,
				adjustedWeightFee: 20,
			},
		]);
		return assetHubWestendRegistryV9435.createType('FeeDetails', [
			{
				inclusionFee,
			},
		]);
	});

const runtimeDispatchInfo = assetHubWestendRegistryV9435.createType('RuntimeDispatchInfo', {
	weight: {
		refTime: 125000000,
		proofSize: 0,
	},
	class: 'Normal',
	partialFee: 149000000,
});

export const assetHubWestendQueryInfoCall = (
	_extrinsic: GenericExtrinsic,
	_length: Uint8Array,
): Promise<RuntimeDispatchInfo> => Promise.resolve().then(() => runtimeDispatchInfo);

export const assetHubWestendQueryInfoAt = (_extrinsic: string, _hash: Hash): Promise<RuntimeDispatchInfo> =>
	Promise.resolve().then(() => runtimeDispatchInfo);

export const assetHubWestendSubmitExtrinsic = (_extrinsic: string): Promise<Hash> =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Hash', []));

const getStorage = () => Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Option<Raw>', ['0x00']));

const chainType = () =>
	Promise.resolve().then(() =>
		assetHubWestendRegistryV9435.createType('ChainType', [
			{
				Live: null,
			},
		]),
	);

const properties = () =>
	Promise.resolve().then(() =>
		assetHubWestendRegistryV9435.createType('ChainProperties', [
			{
				ss58Format: '0',
				tokenDecimals: '12',
				tokenSymbol: 'DOT',
			},
		]),
	);

const getFinalizedHead = () => Promise.resolve().then(() => blockHash5236177);

const health = () =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Health', ['0x7a000000000000000001']));

const localListenAddresses = () =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Vec<Text>', [localListenAddressesHex]));

const nodeRoles = () =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Vec<NodeRole>', ['0x0400']));

const localPeerId = () =>
	Promise.resolve().then(() =>
		assetHubWestendRegistryV9435.createType('Text', [
			'0x313244334b6f6f57415a66686a79717a4674796435357665424a78545969516b5872614d584c704d4d6a355a6f3471756431485a',
		]),
	);

export const assetHubWestendPendingExtrinsics = (): Promise<Vec<Extrinsic>> =>
	Promise.resolve().then(() => assetHubWestendRegistryV9435.createType('Vec<Extrinsic>', []));

export const assetHubWestendTx = (): Extrinsic =>
	assetHubWestendRegistryV9435.createType('Extrinsic', [balancesTransferValid]);

const traceBlock = () =>
	Promise.resolve().then(() => kusamaRegistry.createType('TraceBlockResponse', [traceBlockRPC.result]));

/**
 * Deafult Mock polkadot-js ApiPromise. Values are largely meant to be accurate for block
 * #5236177, which is what most Service unit tests are based on.
 */
export const mockAssetHubWestendApi = {
	runtimeVersion,
	call: {
		transactionPaymentApi: {
			queryInfo: assetHubWestendQueryInfoCall,
			queryFeeDetails,
		},
	},
	consts: {
		system: {
			blockLength: {
				max: {
					normal: new BN(3932160),
					operational: new BN(5242880),
					mandatory: new BN(5242880),
				},
			},
			blockWeights: {
				baseBlock: new BN(5481991000),
				maxBlock: assetHubWestendRegistryV9435.createType('u64', 15),
				perClass: defaultMockApi.consts.system.blockWeights.perClass,
			},
		},
		transactionPayment: {
			operationalFeeMultiplier: new BN(5),
		},
	},
	createType: assetHubWestendRegistryV9435.createType.bind(assetHubWestendRegistryV9435),
	registry: assetHubWestendRegistryV9435,

	tx: getPalletDispatchables,
	runtimeMetadata: assetHubWestendMetadata,
	rpc: {
		chain: {
			getHeader,
			assetHubWestendGetBlock,
			getBlockHash: getBlockHashGenesis,
			getFinalizedHead,
		},
		state: {
			getRuntimeVersion,
			getMetadata,
			getStorage,
			traceBlock,
		},
		system: {
			chain,
			health,
			localListenAddresses,
			nodeRoles,
			localPeerId,
			version,
			chainType,
			properties,
		},
		payment: {
			queryInfo: assetHubWestendQueryInfoAt,
			queryFeeDetails,
		},
		author: {
			assetHubWestendSubmitExtrinsic,
			assetHubWestendPendingExtrinsics,
		},
	},
	derive: {
		chain: {
			getHeader: deriveGetHeader,
			getBlock: assetHubWestendDeriveGetBlock,
		},
	},
	query: {
		nominationPools: {
			metadata: mockMetaData,
		},
	},
} as unknown as ApiPromise;
