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

import { polkadotMetadataRpcV1000001 } from '../../../test-helpers/metadata/polkadotV1000001Metadata';
import { polkadotRegistryV1000001 } from '../../../test-helpers/registries';
import { balancesTransferValid, blockHash18468942, mockBlock18468942, testAddressController } from '.';
import { localListenAddressesHex } from './data/localListenAddresses';
import { getPalletDispatchables } from './data/mockDispatchablesData';
import { getMetadata as mockMetaData } from './data/mockNonimationPoolResponseData';
import traceBlockRPC from './data/traceBlock.json';
import { defaultMockApi } from './mockApi';

const chain = () =>
	Promise.resolve().then(() => {
		return polkadotRegistryV1000001.createType('Text', 'Polkadot');
	});

export const getBlockXCM = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return {
			block: mockBlock18468942,
		};
	});

export const deriveGetBlockXCM = (_hash: Hash): Promise<{ block: Block; author: AccountId }> =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistryV1000001.createType('AccountId', '16A1zLQ3KjMnxch1NAU44hoijFK3fHUjqb11bVgcHCfoj9z3'),
			block: mockBlock18468942,
		};
	});

const getHeader = (_hash: Hash) => Promise.resolve().then(() => mockBlock18468942.header);

const runtimeVersion = {
	specName: polkadotRegistryV1000001.createType('Text', 'polkadot'),
	specVersion: polkadotRegistryV1000001.createType('u32', 16),
	transactionVersion: polkadotRegistryV1000001.createType('u32', 2),
	implVersion: polkadotRegistryV1000001.createType('u32', 0),
	implName: polkadotRegistryV1000001.createType('Text', 'parity-polkadot'),
	authoringVersion: polkadotRegistryV1000001.createType('u32', 0),
};

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return runtimeVersion;
	});

const getMetadata = () => Promise.resolve().then(() => polkadotMetadataRpcV1000001);

const deriveGetHeader = () =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistryV1000001.createType('AccountId', '16A1zLQ3KjMnxch1NAU44hoijFK3fHUjqb11bVgcHCfoj9z3'),
		};
	});

const version = () =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Text', '0.8.22-c6ee8675-x86_64-linux-gnu'));

export const activeEraAtXCM = (_hash: Hash): Promise<Option<ActiveEraInfo>> =>
	Promise.resolve().then(() =>
		polkadotRegistryV1000001.createType('Option<ActiveEraInfo>', {
			index: 49,
			start: 1595259378000,
		}),
	);

export const erasStartSessionIndexAtXCM = (_hash: Hash, _activeEra: EraIndex): Promise<Option<SessionIndex>> =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Option<SessionIndex>', 330));

export const bondedAtXCM = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Option<AccountId>', testAddressController));

export const ledgerAtXCM = (_hash: Hash, _address: string): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		polkadotRegistryV1000001.createType(
			'Option<StakingLedger>',
			'0x2c2a55b5e0d28cc772b47bb9b25981cbb69eca73f7c3388fb6464e7d24be470e0700e87648170700e8764817008c000000000100000002000000030000000400000005000000060000000700000008000000090000001700000018000000190000001a0000001b0000001c0000001d0000001e0000001f000000200000002100000022000000230000002400000025000000260000002700000028000000290000002a0000002b0000002c0000002d0000002e0000002f000000',
		),
	);

// For getting the blockhash of the genesis block
const getBlockHashGenesis = (_zero: number) =>
	Promise.resolve().then(() =>
		polkadotRegistryV1000001.createType(
			'BlockHash',
			'0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
		),
	);

const queryFeeDetails = () =>
	Promise.resolve().then(() => {
		const inclusionFee = polkadotRegistryV1000001.createType('Option<InclusionFee>', {
			baseFee: 10000000,
			lenFee: 143000000,
			adjustedWeightFee: 20,
		});
		return polkadotRegistryV1000001.createType('FeeDetails', {
			inclusionFee,
		});
	});

const runtimeDispatchInfo = polkadotRegistryV1000001.createType('RuntimeDispatchInfo', {
	weight: [195000000, 0],
	class: 'Normal',
	partialFee: 149000000,
});

export const queryInfoCallXCM = (_extrinsic: GenericExtrinsic, _length: Uint8Array): Promise<RuntimeDispatchInfo> =>
	Promise.resolve().then(() => runtimeDispatchInfo);

export const queryInfoAtXCM = (_extrinsic: string, _hash: Hash): Promise<RuntimeDispatchInfo> =>
	Promise.resolve().then(() => runtimeDispatchInfo);

export const submitExtrinsicXCM = (_extrinsic: string): Promise<Hash> =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Hash'));

const getStorage = () => Promise.resolve().then(() => polkadotRegistryV1000001.createType('Option<Raw>', '0x00'));

const chainType = () =>
	Promise.resolve().then(() =>
		polkadotRegistryV1000001.createType('ChainType', {
			Live: null,
		}),
	);

const properties = () =>
	Promise.resolve().then(() =>
		polkadotRegistryV1000001.createType('ChainProperties', {
			ss58Format: '0',
			tokenDecimals: '12',
			tokenSymbol: 'DOT',
		}),
	);

const getFinalizedHead = () => Promise.resolve().then(() => blockHash18468942);

const health = () =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Health', '0x7a000000000000000001'));

const localListenAddresses = () =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Vec<Text>', localListenAddressesHex));

const nodeRoles = () => Promise.resolve().then(() => polkadotRegistryV1000001.createType('Vec<NodeRole>', '0x0400'));

const localPeerId = () =>
	Promise.resolve().then(() =>
		polkadotRegistryV1000001.createType(
			'Text',
			'0x313244334b6f6f57415a66686a79717a4674796435357665424a78545969516b5872614d584c704d4d6a355a6f3471756431485a',
		),
	);

export const pendingExtrinsicsXCM = (): Promise<Vec<Extrinsic>> =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('Vec<Extrinsic>'));

export const txXCM = (): Extrinsic => polkadotRegistryV1000001.createType('Extrinsic', balancesTransferValid);

const traceBlock = () =>
	Promise.resolve().then(() => polkadotRegistryV1000001.createType('TraceBlockResponse', traceBlockRPC.result));

/**
 * Mock polkadot-js ApiPromise. Values are largely meant to be accurate for block
 * #18468942, which is what the XCM test in BlockService use.
 */
export const mockApiBlock18468942 = {
	runtimeVersion,
	call: {
		transactionPaymentApi: {
			queryInfo: queryInfoCallXCM,
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
				maxBlock: polkadotRegistryV1000001.createType('u64', 15),
				perClass: defaultMockApi.consts.system.blockWeights.perClass,
			},
		},
		transactionPayment: {
			operationalFeeMultiplier: new BN(5),
		},
	},
	createType: polkadotRegistryV1000001.createType.bind(polkadotRegistryV1000001),
	registry: polkadotRegistryV1000001,

	tx: getPalletDispatchables,
	runtimeMetadata: polkadotMetadataRpcV1000001,
	rpc: {
		chain: {
			getHeader,
			getBlock: getBlockXCM,
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
			queryInfo: queryInfoAtXCM,
			queryFeeDetails,
		},
		author: {
			submitExtrinsicXCM,
			pendingExtrinsicsXCM,
		},
	},
	derive: {
		chain: {
			getHeader: deriveGetHeader,
			getBlock: deriveGetBlockXCM,
		},
	},
	query: {
		nominationPools: {
			metadata: mockMetaData,
		},
	},
} as unknown as ApiPromise;
