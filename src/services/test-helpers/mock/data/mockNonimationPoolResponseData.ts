import { Option, u32, u128 } from '@polkadot/types/';
import {
	PalletNominationPoolsBondedPoolInner,
	PalletNominationPoolsRewardPool,
} from '@polkadot/types/lookup';

import { polkadotRegistryV9300 } from '../../../../test-helpers/registries';

export const getBondedPools =
	(): Promise<PalletNominationPoolsBondedPoolInner> =>
		Promise.resolve().then(() => {
			const bondedPool = {
				points: '2000000000000',
				state: 'Destroying',
				memberCounter: '1',
				roles: {
					depositor: '5GxzQ5VrXsnEjsmbohVbVhprovGAXoZrQvMDi2H5iTJEuRN8',
					root: '5GQTABndmBWpK3T83Bzmu8qAU4Rxh1122zct5YtztajcnEmj',
					nominator: '5GQTABndmBWpK3T83Bzmu8qAU4Rxh1122zct5YtztajcnEmj',
					stateToggler: '5GQTABndmBWpK3T83Bzmu8qAU4Rxh1122zct5YtztajcnEmj',
				},
			};

			return polkadotRegistryV9300.createType(
				'PalletNominationPoolsBondedPoolInner',
				bondedPool
			);
		});

export const getRewardPools = (): Promise<PalletNominationPoolsRewardPool> =>
	Promise.resolve().then(() => {
		const rewardPool = {
			lastRecordedRewardCounter: '0',
			lastRecordedTotalPayouts: '0',
			totalRewardsClaimed: '0',
		};

		return polkadotRegistryV9300.createType(
			'PalletNominationPoolsRewardPool',
			rewardPool
		);
	});

export const getMetadata = (): string => {
	return '0x4a757374204174652053746f6d61636861636865';
};

export const counterForBondedPools = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 96);
	});

export const counterForMetadata = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 93);
	});

export const counterForPoolMembers = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 228);
	});

export const counterForReversePoolIdLookup = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 96);
	});

export const counterForSubPoolsStorage = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 39);
	});

export const counterForRewardPools = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 96);
	});

export const lastPoolId = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 122);
	});

export const maxPoolMembers = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 524288);
	});

export const maxPoolMembersPerPool = (): Promise<Option<u32>> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('Option<u32>', null);
	});

export const maxPools = (): Promise<u32> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u32', 512);
	});

export const minCreateBond = (): Promise<u128> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u128', 1000000000000);
	});

export const minJoinBond = (): Promise<u128> =>
	Promise.resolve().then(() => {
		return polkadotRegistryV9300.createType('u128', 100000000000);
	});
