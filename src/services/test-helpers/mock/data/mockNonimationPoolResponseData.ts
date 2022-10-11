
import { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsRewardPool } from '@polkadot/types/lookup';
import { bool, Null, Struct, u128 } from '@polkadot/types';
import BN from 'bn.js';
import { polkadotRegistryV9122 } from '../../test-helpers/registries';
import { rococoRegistry } from '../../../../test-helpers/registries';


export const bondedPools = (): Promise<AssetMetadata> =>
Promise.resolve().then(() => {
    const responseObj: PalletNominationPoolsBondedPoolInner = {
        points: rococoRegistry.createType('u128', '2000000000000'),
        state: rococoRegistry.createType('PalletNominationPoolsPoolState', 'Option<Open>'),
        state: polkadotRegistryV9122.createType(
			'Compact<u128>',
			new BN('2000000000000')
		), 
        state: "Open",
        memberCounter: 1,
        roles: {
            depositor: "5GxzQ5VrXsnEjsmbohVbVhprovGAXoZrQvMDi2H5iTJEuRN8",
            root: "5GxzQ5VrXsnEjsmbohVbVhprovGAXoZrQvMDi2H5iTJEuRN8",
            nominator: "5GxzQ5VrXsnEjsmbohVbVhprovGAXoZrQvMDi2H5iTJEuRN8",
            stateToggler: "5GxzQ5VrXsnEjsmbohVbVhprovGAXoZrQvMDi2H5iTJEuRN8"
        }
    };

    return rococoRegistry.createType('AssetMetadata', responseObj);
});