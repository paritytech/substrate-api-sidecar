import { EventData } from '@polkadot/types/generic/Event';

import { IFrameMethod } from '.';

export interface ISanitizedEvent {
	method: string | IFrameMethod;
	data: EventData;
}
