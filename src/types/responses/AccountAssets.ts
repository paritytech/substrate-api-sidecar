import {
	AssetBalance,
	TAssetBalance,
	TAssetDepositBalance,
} from '@polkadot/types/interfaces';

import { IAt } from '.';

export interface IAccountAssetsBalanceVec {
	at: IAt;
	assets: AssetBalance[];
}

export interface IAccountAssetApproval {
	at: IAt;
	amount: TAssetBalance;
	deposit: TAssetDepositBalance;
}
