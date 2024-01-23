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
	RuntimeDispatchInfoV2,
	SessionIndex,
	StakingLedger,
} from '@polkadot/types/interfaces';
import BN from 'bn.js';

import { assetHubKusamaV1000000 } from '../../../test-helpers/metadata/assetHubKusamaMetadataV1000000';
import { assetHubKusamaRegistryV1000000 } from '../../../test-helpers/registries';
import { balancesTransferValid, blockHash3356195, mockBlock3356195, testAddressController } from '.';
import { localListenAddressesHex } from './data/localListenAddresses';
import { getPalletDispatchables } from './data/mockDispatchablesData';
import { getMetadata as mockMetaData } from './data/mockNonimationPoolResponseData';
import traceBlockRPC from './data/traceBlock.json';
import { defaultMockApi } from './mockApi';

const chain = () =>
	Promise.resolve().then(() => {
		return assetHubKusamaRegistryV1000000.createType('Text', 'Kusama Asset Hub');
	});

export const assetHubKusamaGetBlock3356195 = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return {
			block: mockBlock3356195,
		};
	});

export const assetHubKusamaDeriveGetBlock3356195 = (_hash: Hash): Promise<{ block: Block; author: AccountId }> =>
	Promise.resolve().then(() => {
		return {
			author: assetHubKusamaRegistryV1000000.createType('AccountId', 'CbLdvHtKPVr1bvt7poBKwJsQUokfjC4kqoMkjeyCDtFs8wQ'),
			block: mockBlock3356195,
		};
	});

const getHeader = (_hash: Hash) => Promise.resolve().then(() => mockBlock3356195.header);

const runtimeVersion = {
	specName: assetHubKusamaRegistryV1000000.createType('Text', 'statemine'),
	specVersion: assetHubKusamaRegistryV1000000.createType('u32', 16),
	transactionVersion: assetHubKusamaRegistryV1000000.createType('u32', 2),
	implVersion: assetHubKusamaRegistryV1000000.createType('u32', 0),
	implName: assetHubKusamaRegistryV1000000.createType('Text', 'parity-kusama'),
	authoringVersion: assetHubKusamaRegistryV1000000.createType('u32', 1),
};

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return runtimeVersion;
	});

const getMetadata = () => Promise.resolve().then(() => assetHubKusamaV1000000);

const deriveGetHeader = () =>
	Promise.resolve().then(() => {
		return {
			author: assetHubKusamaRegistryV1000000.createType('AccountId', 'CbLdvHtKPVr1bvt7poBKwJsQUokfjC4kqoMkjeyCDtFs8wQ'),
		};
	});

const version = () =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Text', '0.8.22-c6ee8675-x86_64-linux-gnu'));

export const assetHubKusamaActiveEraAt3356195 = (_hash: Hash): Promise<Option<ActiveEraInfo>> =>
	Promise.resolve().then(() =>
		assetHubKusamaRegistryV1000000.createType('Option<ActiveEraInfo>', {
			index: 49,
			start: 1595259378000,
		}),
	);

export const assetHubKusamaErasStartSessionIndexAt3356195 = (
	_hash: Hash,
	_activeEra: EraIndex,
): Promise<Option<SessionIndex>> =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Option<SessionIndex>', 330));

export const assetHubKusamaBondedAt3356195 = (_hash: Hash, _address: string): Promise<Option<AccountId>> =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Option<AccountId>', testAddressController));

export const assetHubKusamaLedgerAt3356195 = (_hash: Hash, _address: string): Promise<Option<StakingLedger>> =>
	Promise.resolve().then(() =>
		assetHubKusamaRegistryV1000000.createType(
			'Option<StakingLedger>',
			'0x2c2a55b5e0d28cc772b47bb9b25981cbb69eca73f7c3388fb6464e7d24be470e0700e87648170700e8764817008c000000000100000002000000030000000400000005000000060000000700000008000000090000001700000018000000190000001a0000001b0000001c0000001d0000001e0000001f000000200000002100000022000000230000002400000025000000260000002700000028000000290000002a0000002b0000002c0000002d0000002e0000002f000000',
		),
	);

// For getting the blockhash of the genesis block
const getBlockHashGenesis = (_zero: number) =>
	Promise.resolve().then(() =>
		assetHubKusamaRegistryV1000000.createType(
			'BlockHash',
			'0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a',
		),
	);

const queryFeeDetails = () =>
	Promise.resolve().then(() => {
		const inclusionFee = assetHubKusamaRegistryV1000000.createType('Option<InclusionFee>', {
			baseFee: 10000000,
			lenFee: 143000000,
			adjustedWeightFee: 20,
		});
		return assetHubKusamaRegistryV1000000.createType('FeeDetails', {
			inclusionFee,
		});
	});

const runtimeDispatchInfoV2 = assetHubKusamaRegistryV1000000.createType('RuntimeDispatchInfoV2', {
	weight: {
		refTime: 1200000000,
		proofSize: 20000,
	},
	class: 'Normal',
	partialFee: 149000000,
});

export const assetHubKusamaQueryInfoCall3356195 = (
	_extrinsic: GenericExtrinsic,
	_length: Uint8Array,
): Promise<RuntimeDispatchInfoV2> => Promise.resolve().then(() => runtimeDispatchInfoV2);

export const assetHubKusamaQueryInfoAt3356195 = (_extrinsic: string, _hash: Hash): Promise<RuntimeDispatchInfoV2> =>
	Promise.resolve().then(() => runtimeDispatchInfoV2);

export const assetHubKusamaSubmitExtrinsic3356195 = (_extrinsic: string): Promise<Hash> =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Hash'));

const getStorage = () => Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Option<Raw>', '0x00'));

const chainType = () =>
	Promise.resolve().then(() =>
		assetHubKusamaRegistryV1000000.createType('ChainType', {
			Live: null,
		}),
	);

const properties = () =>
	Promise.resolve().then(() =>
		assetHubKusamaRegistryV1000000.createType('ChainProperties', {
			ss58Format: '2',
			tokenDecimals: '12',
			tokenSymbol: 'KSM',
		}),
	);

const getFinalizedHead = () => Promise.resolve().then(() => blockHash3356195);

const health = () =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Health', '0x7a000000000000000001'));

const localListenAddresses = () =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Vec<Text>', localListenAddressesHex));

const nodeRoles = () =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Vec<NodeRole>', '0x0400'));

const localPeerId = () =>
	Promise.resolve().then(() =>
		assetHubKusamaRegistryV1000000.createType('Text', '12D3KooWA88bs6zSQmvvTvwqgW8RDFos7KsJrfCAXjm9QyDESgtU'),
	);

export const assetHubKusamaPendingExtrinsics3356195 = (): Promise<Vec<Extrinsic>> =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('Vec<Extrinsic>'));

export const assetHubKusamaTx3356195 = (): Extrinsic =>
	assetHubKusamaRegistryV1000000.createType('Extrinsic', balancesTransferValid);

const traceBlock = () =>
	Promise.resolve().then(() => assetHubKusamaRegistryV1000000.createType('TraceBlockResponse', traceBlockRPC.result));

/**
 * Deafult Mock polkadot-js ApiPromise. Values are largely meant to be accurate for block
 * #3356195, which is what most Service unit tests are based on.
 */
export const mockAssetHubKusamaApiBlock3356195 = {
	runtimeVersion,
	call: {
		transactionPaymentApi: {
			queryInfo: assetHubKusamaQueryInfoCall3356195,
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
				maxBlock: assetHubKusamaRegistryV1000000.createType('u64', 15),
				perClass: defaultMockApi.consts.system.blockWeights.perClass,
			},
		},
		transactionPayment: {
			operationalFeeMultiplier: new BN(5),
		},
	},
	createType: assetHubKusamaRegistryV1000000.createType.bind(assetHubKusamaRegistryV1000000),
	registry: assetHubKusamaRegistryV1000000,

	tx: getPalletDispatchables,
	runtimeMetadata: assetHubKusamaV1000000,
	rpc: {
		chain: {
			getHeader,
			getBlock: assetHubKusamaGetBlock3356195,
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
			queryInfo: assetHubKusamaQueryInfoAt3356195,
			queryFeeDetails,
		},
		author: {
			assetHubKusamaSubmitExtrinsic3356195,
			assetHubKusamaPendingExtrinsics3356195,
		},
	},
	derive: {
		chain: {
			getHeader: deriveGetHeader,
			getBlock: assetHubKusamaDeriveGetBlock3356195,
		},
	},
	query: {
		nominationPools: {
			metadata: mockMetaData,
		},
	},
} as unknown as ApiPromise;
