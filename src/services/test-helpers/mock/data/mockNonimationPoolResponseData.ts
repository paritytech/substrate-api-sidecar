
import { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsRewardPool } from '@polkadot/types/lookup';
import { Codec } from '@polkadot/types/types';

import { IPalletNominationPool } from '../../../../types/responses/';
// import { bool, Null, Struct, u128 } from '@polkadot/types';
// import BN from 'bn.js';
import { polkadotRegistryV9300 } from '../../../../test-helpers/registries';
// import { polkadotRegistryV9122 } from '../../../../test-helpers/registries';
// import { PalletsNominationPools } from 'src/controllers/pallets';


export const getBondedPools = (): Promise<PalletNominationPoolsBondedPoolInner> =>
    Promise.resolve().then(() => {
        const bondedPool = {
            points: "2000000000000",
            state: "Destroying",
            memberCounter: "1",
            roles:  {
                    "depositor": "5GxzQ5VrXsnEjsmbohVbVhprovGAXoZrQvMDi2H5iTJEuRN8",
                    "root": "5GQTABndmBWpK3T83Bzmu8qAU4Rxh1122zct5YtztajcnEmj",
                    "nominator": "5GQTABndmBWpK3T83Bzmu8qAU4Rxh1122zct5YtztajcnEmj",
                    "stateToggler": "5GQTABndmBWpK3T83Bzmu8qAU4Rxh1122zct5YtztajcnEmj",
                },
            };

            return polkadotRegistryV9300.createType("PalletNominationPoolsBondedPoolInner", bondedPool);
    });

export const getRewardPools = (): Promise<PalletNominationPoolsRewardPool> =>
    Promise.resolve().then(() => {
    const rewardPool = {
        lastRecordedRewardCounter: "0",
        lastRecordedTotalPayouts: "0",
        totalRewardsClaimed: "0"
    };

    return polkadotRegistryV9300.createType("PalletNominationPoolsRewardPool", rewardPool);
    });

export const getMetadata = (): string => {
    return "0x4a757374204174652053746f6d61636861636865";
}


export const nominationPoolResponseData = (): Promise<Codec | IPalletNominationPool> =>
    Promise.resolve().then(async () => {
        const bondedPoolData = await getBondedPools();
        const rewardPoolData = await getRewardPools();
        const hash = polkadotRegistryV9300.createType("BlockHash", "0x64c6d3db75e33e5ef617bc9851078a4c387fcff7ca0eada54e46293d532e3c84");
        const height = "12890587";
        const at = {
            hash,
            height,
        };
        const metadata: string = getMetadata();

        return polkadotRegistryV9300.createType("IPalletNominationPool", {
            at: at,
            bondedPool: bondedPoolData,
            rewardPool: rewardPoolData,
            metadata: metadata,
        });
    });