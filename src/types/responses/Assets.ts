import { Option } from '@polkadot/types/codec';
import { AssetDetails, AssetMetadata } from '@polkadot/types/interfaces/';

import { IAt } from '.';

export interface IAssetInfo {
	at: IAt;
	assetInfo: Option<AssetDetails>;
	assetMetaData: AssetMetadata;
}
