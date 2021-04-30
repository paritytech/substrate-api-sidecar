import { IAt } from '.';
import { TAssetBalance } from '@polkadot/types/interfaces'

interface IAssetBalance {
    assetId: number;
    balances: TAssetBalance;
    isFrozen: boolean;
}

export interface IAccountAssetsBalance {
    at: IAt;
    balances: TAssetBalance;
    isFrozen: boolean;
    isSufficient: boolean;
}

export interface IAccountAssetsBalanceVec {
    at: IAt;
    assets: IAssetBalance[]
}
