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
import { GenericExtrinsic, u32, Vec } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import {
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

import { kusamaMetadataV1002000 } from '../../../test-helpers/metadata/kusamaV1002000Metadata';
import { kusamaRegistryV1002000 } from '../../../test-helpers/registries';
import { balancesTransferValid, blockHash22939322, mockBlock22939322, testAddressControllerKusama } from '.';
import { localListenAddressesHex } from './data/localListenAddresses';
import { getPalletDispatchables } from './data/mockDispatchablesData';
import { getMetadata as mockMetaData } from './data/mockNonimationPoolResponseData';
import traceBlockRPC from './data/traceBlock.json';

const chain = () =>
	Promise.resolve().then(() => {
		return kusamaRegistryV1002000.createType('Text', 'Kusama');
	});

export const getBlock22939322 = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return {
			block: mockBlock22939322,
		};
	});

export const deriveGetBlock22939322 = (_hash: Hash): Promise<{ block: Block; author: AccountId }> =>
	Promise.resolve().then(() => {
		return {
			author: kusamaRegistryV1002000.createType('AccountId', '1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'),
			block: mockBlock22939322,
		};
	});

const getHeader = (_hash: Hash) => Promise.resolve().then(() => mockBlock22939322.header);

const runtimeVersion = {
	specName: kusamaRegistryV1002000.createType('Text', 'kusama'),
	specVersion: kusamaRegistryV1002000.createType('u32', 1002000),
	transactionVersion: kusamaRegistryV1002000.createType('u32', 25),
	implVersion: kusamaRegistryV1002000.createType('u32', 0),
	implName: kusamaRegistryV1002000.createType('Text', 'parity-kusama'),
	authoringVersion: kusamaRegistryV1002000.createType('u32', 2),
};

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return runtimeVersion;
	});

const getMetadata = () => Promise.resolve().then(() => kusamaMetadataV1002000);

const deriveGetHeader = () =>
	Promise.resolve().then(() => {
		return {
			author: kusamaRegistryV1002000.createType('AccountId', '1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'),
		};
	});

const version = () =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Text', '0.8.22-c6ee8675-x86_64-linux-gnu'));

export const activeEraAt22939322 = (_hash: Hash): Promise<Option<ActiveEraInfo>> =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType('Option<ActiveEraInfo>', {
			index: 6555,
			start: 1714328874000,
		}),
	);

export const currentEraAt22939322 = (_hash: Hash): Promise<u32 | Option<u32>> =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Option<u32>', 6555));

export const erasStartSessionIndexAt22939322 = (_hash: Hash, _activeEra: EraIndex): Promise<Option<SessionIndex>> =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Option<SessionIndex>', 38713));

export const bondedAt22939322 = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Option<AccountId>', testAddressControllerKusama));

export const ledgerAt22939322 = (_hash: Hash, _address: string): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType(
			'Option<StakingLedger>',
			'0x2c2a55b5e0d28cc772b47bb9b25981cbb69eca73f7c3388fb6464e7d24be470e0700e87648170700e8764817008c000000000100000002000000030000000400000005000000060000000700000008000000090000001700000018000000190000001a0000001b0000001c0000001d0000001e0000001f000000200000002100000022000000230000002400000025000000260000002700000028000000290000002a0000002b0000002c0000002d0000002e0000002f000000',
		),
	);

// For getting the blockhash of the genesis block
const getBlockHashGenesis = (_zero: number) =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType(
			'BlockHash',
			'0xc0096358534ec8d21d01d34b836eed476a1c343f8724fa2153dc0725ad797a90',
		),
	);

const queryFeeDetails = () =>
	Promise.resolve().then(() => {
		const inclusionFee = kusamaRegistryV1002000.createType('Option<InclusionFee>', {
			baseFee: 10000000,
			lenFee: 143000000,
			adjustedWeightFee: 20,
		});
		return kusamaRegistryV1002000.createType('FeeDetails', {
			inclusionFee,
		});
	});

const runtimeDispatchInfo = kusamaRegistryV1002000.createType('RuntimeDispatchInfo', {
	weight: {
		refTime: 1200000000,
		proofSize: 20000,
	},
	class: 'Normal',
	partialFee: 149000000,
});

export const queryInfoCall22939322 = (
	_extrinsic: GenericExtrinsic,
	_length: Uint8Array,
): Promise<RuntimeDispatchInfo> => Promise.resolve().then(() => runtimeDispatchInfo);

export const queryInfoAt22939322 = (_extrinsic: string, _hash: Hash): Promise<RuntimeDispatchInfo> =>
	Promise.resolve().then(() => runtimeDispatchInfo);

export const submitExtrinsic22939322 = (_extrinsic: string): Promise<Hash> =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Hash'));

const getStorage = () => Promise.resolve().then(() => kusamaRegistryV1002000.createType('Option<Raw>', '0x00'));

const chainType = () =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType('ChainType', {
			Live: null,
		}),
	);

const properties = () =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType('ChainProperties', {
			ss58Format: '2',
			tokenDecimals: '12',
			tokenSymbol: 'KSM',
		}),
	);

const getFinalizedHead = () => Promise.resolve().then(() => blockHash22939322);

const health = () =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Health', '0x7a000000000000000001'));

const localListenAddresses = () =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Vec<Text>', localListenAddressesHex));

const nodeRoles = () => Promise.resolve().then(() => kusamaRegistryV1002000.createType('Vec<NodeRole>', '0x0400'));

const localPeerId = () =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType(
			'Text',
			'0x313244334b6f6f57415a66686a79717a4674796435357665424a78545969516b5872614d584c704d4d6a355a6f3471756431485a',
		),
	);

export const pendingExtrinsics22939322 = (): Promise<Vec<Extrinsic>> =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('Vec<Extrinsic>'));

export const tx22939322 = (): Extrinsic => kusamaRegistryV1002000.createType('Extrinsic', balancesTransferValid);

const traceBlock = () =>
	Promise.resolve().then(() => kusamaRegistryV1002000.createType('TraceBlockResponse', traceBlockRPC.result));

/**
 * Deafult Mock polkadot-js ApiPromise. Values are largely meant to be accurate for block
 * #22939322, which is what most Service unit tests are based on.
 */
export const defaultMockApi22939322 = {
	runtimeVersion,
	call: {
		transactionPaymentApi: {
			queryInfo: queryInfoCall22939322,
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
				maxBlock: kusamaRegistryV1002000.createType('u64', 15),
				perClass: {
					normal: {
						baseExtrinsic: new BN(85212000),
						maxExtrinsic: new BN(1479914788000),
						maxTotal: new BN(1500000000000),
						reserved: new BN(0),
					},
					operational: {
						baseExtrinsic: new BN(85212000),
						maxExtrinsic: new BN(1979914788000),
						maxTotal: new BN(2000000000000),
						reserved: new BN(500000000000),
					},
					mandatory: {
						baseExtrinsic: new BN(85212000),
						maxExtrinsic: null,
						maxTotal: null,
						reserved: null,
					},
				},
			},
		},
		transactionPayment: {
			operationalFeeMultiplier: new BN(5),
		},
		staking: {
			historyDepth: kusamaRegistryV1002000.createType('u32', 84),
		},
	},
	createType: kusamaRegistryV1002000.createType.bind(kusamaRegistryV1002000),
	registry: kusamaRegistryV1002000,

	tx: getPalletDispatchables,
	runtimeMetadata: kusamaRegistryV1002000,
	rpc: {
		chain: {
			getHeader,
			getBlock22939322,
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
			queryInfo: queryInfoAt22939322,
			queryFeeDetails,
		},
		author: {
			submitExtrinsic22939322,
			pendingExtrinsics22939322,
		},
	},
	derive: {
		chain: {
			getHeader: deriveGetHeader,
			getBlock: deriveGetBlock22939322,
		},
	},
	query: {
		nominationPools: {
			metadata: mockMetaData,
		},
	},
} as unknown as ApiPromise;
