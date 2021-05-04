import {
	ActionGroup,
	Operation,
	TraceEvent,
	TraceSpan,
} from '../../services/blocks/trace';
import { IAt } from './At';

export interface BlocksTrace {
	at: IAt;
	storageKeys: string;
	tracingTargets: string;
	events: TraceEvent[];
	spans: TraceSpan[];
}

export interface BlocksTraceOperations {
	at: IAt;
	operations: Operation[];
	actions?: ActionGroup[];
}
