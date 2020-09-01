import { EventData } from '@polkadot/types/generic/Event';

import { IDispatchable } from '.';

export interface ISanitizedEvent {
	method: string | IDispatchable;
	data: EventData;
}
