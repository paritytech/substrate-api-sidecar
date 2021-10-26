import { ApiDecoration } from '@polkadot/api/types';
import { bool, StorageKey } from '@polkadot/types';
import { AssetId, BlockHash } from '@polkadot/types/interfaces';
import { BadRequest } from 'http-errors';

import {
	IAccountAssetApproval,
	IAccountAssetsBalances,
	IAssetBalance,
} from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class AccountsAssetsService extends AbstractService {
	/**
	 * Fetch all the `AssetBalance`s alongside their `AssetId`'s for a given array of queried `AssetId`'s.
	 * If none are queried the function will get all `AssetId`'s associated with the
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
	): Promise<IAccountAssetsBalances> {
		const { api } = this;
		const historicApi = await api.at(hash);

		// Check if this runtime has the assets pallet
		this.checkAssetsError(historicApi);

		const { number } = await api.rpc.chain.getHeader(hash);

		let response;
		if (assets.length === 0) {
			/**
			 * This will query all assets and return them in an array
			 */
			const keys = await historicApi.query.assets.asset.keys();
			const assetIds = this.extractAssetIds(keys);

			response = await this.queryAssets(historicApi, assetIds, address);
		} else {
			/**
			 * This will query all assets by the requested AssetIds
			 */
			response = await this.queryAssets(historicApi, assets, address);
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
	 * which consists of a `delegate` and an `owner`
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
		const historicApi = await api.at(hash);

		// Check if this runtime has the assets pallet
		this.checkAssetsError(historicApi);

		const [{ number }, assetApproval] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.assets.approvals(assetId, address, delegate),
		]);

		let amount = null,
			deposit = null;
		if (assetApproval.isSome) {
			({ amount, deposit } = assetApproval.unwrap());
		}

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
	 * Takes in an array of `AssetId`s, and an `AccountId` and returns
	 * all balances tied to those `AssetId`s.
	 *
	 * @param api ApiPromise
	 * @param assets An Array of `AssetId`s or numbers representing `assetId`s
	 * @param address An `AccountId` associated with the queried path
	 */
	async queryAssets(
		historicApi: ApiDecoration<'promise'>,
		assets: AssetId[] | number[],
		address: string
	): Promise<IAssetBalance[]> {
		return Promise.all(
			assets.map(async (assetId: AssetId | number) => {
				const assetBalance = await historicApi.query.assets.account(
					assetId,
					address
				);

				return {
					assetId,
					balance: assetBalance.balance,
					isFrozen: assetBalance.isFrozen,
					isSufficient:
						assetBalance.sufficient || (assetBalance['isSufficient'] as bool),
				};
			})
		);
	}

	/**
	 * @param keys Extract `assetId`s from an array of storage keys
	 */
	extractAssetIds(keys: StorageKey<[AssetId]>[]): AssetId[] {
		return keys.map(({ args: [assetId] }) => assetId);
	}

	/**
	 * Checks if the historicApi has the assets pallet. If not
	 * it will throw a BadRequest error.
	 *
	 * @param historicApi Decorated historic api
	 */
	private checkAssetsError(historicApi: ApiDecoration<'promise'>): void {
		if (!historicApi.query.assets) {
			throw new BadRequest(
				`The runtime does not include the assets pallet at this block.`
			);
		}
	}
}
