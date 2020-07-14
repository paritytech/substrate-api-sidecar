import { EventData } from '@polkadot/types/generic/Event';

export interface ISanitizedEvent {
	method: string;
	data: EventData;
}
