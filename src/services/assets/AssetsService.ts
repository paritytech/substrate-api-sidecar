import { ApiPromise } from "@polkadot/api";
import { AbstractService } from "../AbstractService";
import { IAssetInfo } from '../../types/responses';
import { BlockHash } from '@polkadot/types/interfaces'

export class AssetsService extends AbstractService {
    constructor(api: ApiPromise) {
        super(api)
    }
    
    async fetchAssetById(hash: BlockHash, index: number): Promise<IAssetInfo> {
        const { api } = this;

        const [{number}, assetInfo, assetMetaData] = await Promise.all([
            api.rpc.chain.getHeader(hash),
            api.query.assets.asset(index),
            api.query.assets.metadata(index)
        ]);

        const at = {
            hash,
            height: number.unwrap().toString(10)
        }

        return {
            at,
            assetInfo,
            assetMetaData
        }
    }
}
