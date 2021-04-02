import { Option } from '@polkadot/types/codec';
import { FundInfo } from '@polkadot/types/interfaces';

import { IAt } from './';

export interface IEntries {
	paraId: number;
	fundInfo: Option<FundInfo> | {};
}

export interface ICrowdloansInfoResponse {
	at: IAt;
	fundInfo: Option<FundInfo>;
}

export interface ICrowdloansResponse {
	at: IAt;
	funds: IEntries[];
}
