import { ApiPromise } from '@polkadot/api';
import { StorageKey } from '@polkadot/types';
import { AnyNumber } from '@polkadot/types/types';
import { AssetId, BlockHash } from '@polkadot/types/interfaces';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { IAccountAssetsBalanceVec } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class AccountsAssetsService extends AbstractService {
	constructor(api: ApiPromise) {
		super(api);
	}

	async fetchAssetBalances(
		hash: BlockHash,
		address: string,
		assets: number[] | []
	): Promise<IAccountAssetsBalanceVec> {
		const { api } = this;
		//Promise<IAccountAssetsBalance | IAccountAssetsBalanceVec>
		/**
		 * If the length of the array is empty then we dont do anything
		 */

		const { number } = await api.rpc.chain.getHeader(hash);

		// Zero is a falsy value, therefore we check to see if the assets array is 0
		const isAssetsEmpty = !!assets.length;

		let queryAllAssets;
		if (isAssetsEmpty) {
			/**
			 * This will query all assets and return them in an array
			 */
			const keys = await api.query.assets.account.keysAt(hash);
			const assetIds = this.extractAssetIds(keys);

			queryAllAssets = async () =>
				await Promise.all(
					assetIds.map((assetId: AssetId) =>
						api.query.assets.account(assetId, address)
					)
				);
		} else {
			/**
			 * This will query all assets by the requested AssetIds
			 */
			queryAllAssets = async () =>
				await Promise.all(
                    assets.map((assetId: number | AnyNumber) =>
						api.query.assets.account(assetId, address)
					)
				);
		}

		const response = await queryAllAssets();

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			assets: response,
		};
	}

	extractAssetIds(keys: StorageKey<[AssetId, AccountId]>[]): AssetId[] {
		return keys.map(({ args: [assetId] }) => assetId).sort((a, b) => a.cmp(b));
	}
}
