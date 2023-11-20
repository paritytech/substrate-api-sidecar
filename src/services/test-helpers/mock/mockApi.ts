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

import { ApiPromise } from '@polkadot/api';
import { GenericExtrinsic, Vec } from '@polkadot/types';
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

import { polkadotMetadata } from '../../../test-helpers/metadata/metadata';
import { kusamaRegistry, polkadotRegistry } from '../../../test-helpers/registries';
import { getPalletDispatchables } from '../mock/data/mockDispatchablesData';
import { balancesTransferValid, blockHash789629, mockBlock789629, testAddressController } from '.';
import { localListenAddressesHex } from './data/localListenAddresses';
import { getMetadata as mockMetaData } from './data/mockNonimationPoolResponseData';
import traceBlockRPC from './data/traceBlock.json';

const chain = () =>
	Promise.resolve().then(() => {
		return polkadotRegistry.createType('Text', 'Polkadot');
	});

export const getBlock = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return {
			block: mockBlock789629,
		};
	});

export const deriveGetBlock = (_hash: Hash): Promise<{ block: Block; author: AccountId }> =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistry.createType('AccountId', '1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'),
			block: mockBlock789629,
		};
	});

const getHeader = (_hash: Hash) => Promise.resolve().then(() => mockBlock789629.header);

const runtimeVersion = {
	specName: polkadotRegistry.createType('Text', 'polkadot'),
	specVersion: polkadotRegistry.createType('u32', 16),
	transactionVersion: polkadotRegistry.createType('u32', 2),
	implVersion: polkadotRegistry.createType('u32', 0),
	implName: polkadotRegistry.createType('Text', 'parity-polkadot'),
	authoringVersion: polkadotRegistry.createType('u32', 0),
};

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return runtimeVersion;
	});

const getMetadata = () => Promise.resolve().then(() => polkadotMetadata);

const deriveGetHeader = () =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistry.createType('AccountId', '1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'),
		};
	});

const version = () =>
	Promise.resolve().then(() => polkadotRegistry.createType('Text', '0.8.22-c6ee8675-x86_64-linux-gnu'));

export const activeEraAt = (_hash: Hash): Promise<Option<ActiveEraInfo>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<ActiveEraInfo>', {
			index: 49,
			start: 1595259378000,
		}),
	);

export const erasStartSessionIndexAt = (_hash: Hash, _activeEra: EraIndex): Promise<Option<SessionIndex>> =>
	Promise.resolve().then(() => polkadotRegistry.createType('Option<SessionIndex>', 330));

export const bondedAt = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => polkadotRegistry.createType('Option<AccountId>', testAddressController));

export const ledgerAt = (_hash: Hash, _address: string): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'Option<StakingLedger>',
			'0x2c2a55b5e0d28cc772b47bb9b25981cbb69eca73f7c3388fb6464e7d24be470e0700e87648170700e8764817008c000000000100000002000000030000000400000005000000060000000700000008000000090000001700000018000000190000001a0000001b0000001c0000001d0000001e0000001f000000200000002100000022000000230000002400000025000000260000002700000028000000290000002a0000002b0000002c0000002d0000002e0000002f000000',
		),
	);

// For getting the blockhash of the genesis block
const getBlockHashGenesis = (_zero: number) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('BlockHash', '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'),
	);

const queryFeeDetails = () =>
	Promise.resolve().then(() => {
		const inclusionFee = polkadotRegistry.createType('Option<InclusionFee>', {
			baseFee: 10000000,
			lenFee: 143000000,
			adjustedWeightFee: 20,
		});
		return polkadotRegistry.createType('FeeDetails', {
			inclusionFee,
		});
	});

const runtimeDispatchInfo = polkadotRegistry.createType('RuntimeDispatchInfo', {
	weight: 195000000,
	class: 'Normal',
	partialFee: 149000000,
});

export const queryInfoCall = (_extrinsic: GenericExtrinsic, _length: Uint8Array): Promise<RuntimeDispatchInfo> =>
	Promise.resolve().then(() => runtimeDispatchInfo);

export const queryInfoAt = (_extrinsic: string, _hash: Hash): Promise<RuntimeDispatchInfo> =>
	Promise.resolve().then(() => runtimeDispatchInfo);

export const submitExtrinsic = (_extrinsic: string): Promise<Hash> =>
	Promise.resolve().then(() => polkadotRegistry.createType('Hash'));

const getStorage = () => Promise.resolve().then(() => polkadotRegistry.createType('Option<Raw>', '0x00'));

const chainType = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('ChainType', {
			Live: null,
		}),
	);

const properties = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('ChainProperties', {
			ss58Format: '0',
			tokenDecimals: '12',
			tokenSymbol: 'DOT',
		}),
	);

const getFinalizedHead = () => Promise.resolve().then(() => blockHash789629);

const health = () => Promise.resolve().then(() => polkadotRegistry.createType('Health', '0x7a000000000000000001'));

const localListenAddresses = () =>
	Promise.resolve().then(() => polkadotRegistry.createType('Vec<Text>', localListenAddressesHex));

const nodeRoles = () => Promise.resolve().then(() => polkadotRegistry.createType('Vec<NodeRole>', '0x0400'));

const localPeerId = () =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'Text',
			'0x313244334b6f6f57415a66686a79717a4674796435357665424a78545969516b5872614d584c704d4d6a355a6f3471756431485a',
		),
	);

export const pendingExtrinsics = (): Promise<Vec<Extrinsic>> =>
	Promise.resolve().then(() => polkadotRegistry.createType('Vec<Extrinsic>'));

export const tx = (): Extrinsic => polkadotRegistry.createType('Extrinsic', balancesTransferValid);

const traceBlock = () =>
	Promise.resolve().then(() => kusamaRegistry.createType('TraceBlockResponse', traceBlockRPC.result));

/**
 * Deafult Mock polkadot-js ApiPromise. Values are largely meant to be accurate for block
 * #789629, which is what most Service unit tests are based on.
 */
export const defaultMockApi = {
	runtimeVersion,
	call: {
		transactionPaymentApi: {
			queryInfo: queryInfoCall,
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
				maxBlock: polkadotRegistry.createType('u64', 15),
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
	},
	createType: polkadotRegistry.createType.bind(polkadotRegistry),
	registry: polkadotRegistry,

	tx: getPalletDispatchables,
	runtimeMetadata: polkadotMetadata,
	rpc: {
		chain: {
			getHeader,
			getBlock,
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
			queryInfo: queryInfoAt,
			queryFeeDetails,
		},
		author: {
			submitExtrinsic,
			pendingExtrinsics,
		},
	},
	derive: {
		chain: {
			getHeader: deriveGetHeader,
			getBlock: deriveGetBlock,
		},
	},
	query: {
		nominationPools: {
			metadata: mockMetaData,
		},
	},
} as unknown as ApiPromise;
