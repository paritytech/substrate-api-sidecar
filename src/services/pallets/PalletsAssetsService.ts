import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';

import { IAssetInfo } from '../../types/responses';
import { AbstractService } from '../AbstractService';

export class PalletsAssetsService extends AbstractService {
	constructor(api: ApiPromise) {
		super(api);
	}

	/**
	 * Fetch an asset's `AssetDetails` and `AssetMetadata` with its `AssetId`.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param assetId `AssetId` used to get info and metadata for an asset
	 */
	async fetchAssetById(hash: BlockHash, assetId: number): Promise<IAssetInfo> {
		const { api } = this;

		const [{ number }, assetInfo, assetMetaData] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.assets.asset(assetId),
			api.query.assets.metadata(assetId),
		]);

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		return {
			at,
			assetInfo,
			assetMetaData,
		};
	}
}
