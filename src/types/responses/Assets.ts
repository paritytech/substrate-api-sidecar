import {IAt} from './At';
import { Option } from '@polkadot/types/codec';
import { AssetDetails, AssetMetadata } from '@polkadot/types/interfaces/'

export interface IAssetInfo {
    at: IAt;
    assetInfo: Option<AssetDetails>;
    assetMetaData: AssetMetadata;
}