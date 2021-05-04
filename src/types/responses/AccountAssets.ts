import {
	TAssetBalance,
	TAssetDepositBalance,
} from '@polkadot/types/interfaces';
import { AssetId } from '@polkadot/types/interfaces/runtime';
import { bool } from '@polkadot/types/primitive';
import { IAt } from '.';

export interface IAssetBalance {
	assetId: AssetId | number;
	balance: TAssetBalance;
	isFrozen: bool;
	isSufficient: bool;
}

export interface IAccountAssetsBalanceVec {
	at: IAt;
	assets: IAssetBalance[];
}

export interface IAccountAssetApproval {
	at: IAt;
	amount: TAssetBalance;
	deposit: TAssetDepositBalance;
}
