import { GenericEventData } from '@polkadot/types';

import { IFrameMethod } from '.';

export interface ISanitizedEvent {
	method: string | IFrameMethod;
	data: GenericEventData;
}
