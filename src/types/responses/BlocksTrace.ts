import {
	ActionGroup,
	BlockTrace,
	Operation,
} from '../../services/blocks/trace';
import { IAt } from './At';

export interface BlocksTrace {
	at: IAt;
	traces: BlockTrace;
}

export interface BlocksTraceOperations {
	at: IAt;
	operations: Operation[];
	actions?: ActionGroup[];
}
