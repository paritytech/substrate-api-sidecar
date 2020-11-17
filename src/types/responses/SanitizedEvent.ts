import { GenericEventData } from '@polkadot/types/generic';

import { IFrameMethod } from '.';

export interface ISanitizedEvent {
	method: string | IFrameMethod;
	data: GenericEventData;
}
