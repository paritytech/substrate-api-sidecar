import { AssetBalance, TAssetBalance } from '@polkadot/types/interfaces';

import { IAt } from '.';

export interface IAssetBalance {
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
	assets: AssetBalance[];
}
