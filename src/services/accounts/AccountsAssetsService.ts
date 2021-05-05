import { ApiPromise } from '@polkadot/api';
import { StorageKey } from '@polkadot/types';
import { AssetId, BlockHash } from '@polkadot/types/interfaces';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import { AnyNumber } from '@polkadot/types/types';

import { IAccountAssetApproval } from '../../types/responses';
import { IAccountAssetsBalance } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class AccountsAssetsService extends AbstractService {
	constructor(api: ApiPromise) {
		super(api);
	}

	/**
	 * Fetch all the `AssetBalance`s along side their `AssetId`'s for a given array of queried AssetId`'s.
	 * If none are queried the function will get all AssetId's associated with the
	 * given `AccountId`, and send back all the `AssetsBalance`s.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address `AccountId` associated with the balances
	 * @param assets An array of `assetId`'s to be queried. If the length is zero
	 * all assetId's associated to the account will be queried
	 */
	async fetchAssetBalances(
		hash: BlockHash,
		address: string,
		assets: number[]
	): Promise<IAccountAssetsBalance> {
		const { api } = this;

		const { number } = await api.rpc.chain.getHeader(hash);

		let response;
		if (assets.length === 0) {
			/**
			 * This will query all assets and return them in an array
			 */
			const keys = await api.query.assets.account.keysAt(hash);
			const assetIds = this.extractAssetIds(keys);

			const queryAllAssets = async () =>
				await Promise.all(
					assetIds.map((assetId: AssetId) =>
						api.query.assets.account(assetId, address)
					)
				);
			response = (await queryAllAssets()).map((asset, i) => {
				return {
					assetId: assetIds[i],
					balance: asset.balance,
					isFrozen: asset.isFrozen,
					isSufficient: asset.isSufficient,
				};
			});
		} else {
			/**
			 * This will query all assets by the requested AssetIds
			 */
			const queryAllAssets = async () =>
				await Promise.all(
					assets.map((assetId: number | AnyNumber) =>
						api.query.assets.account(assetId, address)
					)
				);

			response = (await queryAllAssets()).map((asset, i) => {
				return {
					assetId: assets[i],
					balance: asset.balance,
					isFrozen: asset.isFrozen,
					isSufficient: asset.isSufficient,
				};
			});
		}

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			assets: response,
		};
	}

	/**
	 * Fetch all `AccountApproval`'s with a given `AssetId` and a `AssetApprovalKey`
	 * which consists of a `delegate` and an `owner(AccoundId)`
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address `AccountId` or owner associated with the approvals
	 * @param assetId `AssetId` associated with the `AssetApproval`
	 * @param delegate `delegate`
	 */
	async fetchAssetApproval(
		hash: BlockHash,
		address: string,
		assetId: number,
		delegate: string
	): Promise<IAccountAssetApproval> {
		const { api } = this;

		/**
		 * AssetApprovalKey, contains the `accountId` as the address key, and the
		 * delegate `accountId`. Both are required for a successfull query
		 */
		const approvalKey = { owner: address, delegate };

		const [{ number }, assetApproval] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.assets.approvals(assetId, approvalKey),
		]);

		const { amount, deposit } = assetApproval.unwrap();

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			amount,
			deposit,
		};
	}

	/**
	 * @param keys An Array of storage keys used to extract `AssetId`'s
	 */
	extractAssetIds(keys: StorageKey<[AssetId, AccountId]>[]): AssetId[] {
		return keys.map(({ args: [assetId] }) => assetId).sort((a, b) => a.cmp(b));
	}
}
