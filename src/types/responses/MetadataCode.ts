import { Option, Raw } from '@polkadot/types';

import { IAt } from '.';

export interface IMetadataCode {
	at: IAt;
	code: Option<Raw>;
}
