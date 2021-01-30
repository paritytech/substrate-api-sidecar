import { AccountInfo, Address } from '@polkadot/types/interfaces';
import * as BN from 'bn.js';

export interface BoolValues {
	[i: string]: unknown;
}

export interface I64Values {
	[i: string]: unknown;
}

export interface StringValues {
	key?: string;
	method?: 'put' | 'get' | 'set';
	res?: string;
	[i: string]: unknown;
}

export interface U64Values {
	[i: string]: unknown;
	ext_id: string;
}

export interface Values {
	i64_values: I64Values;
	string_values: StringValues;
	u64_values: U64Values;
	bool_values: BoolValues;
}

export interface TraceEvent {
	name: string;
	parent_id: number;
	target: string;
	values: Values;
}

export interface EventAnnotated extends TraceEvent {
	storagePath: KeyInfo;
	parentSpanId?: ParentSpanId;
	eventIndex: number;
}

export interface EventWithPhase extends EventAnnotated {
	phase: PhaseId;
	primarySpanId: ParentSpanId;
}

export interface EventWithAccountInfo extends EventWithPhase {
	accountInfo: AccountInfo;
	address: Address;
}

export interface TraceSpan {
	id: number;
	line: number;
	name: string;
	exited: [
		{
			nanos: number;
			secs: number;
		}
	];
	entered: [
		{
			nanos: number;
			secs: number;
		}
	];
	parent_id: number;
	target: string;
	values: Values;
}

/**
 * Span with direct descendants
 */
export interface SpanWithChildren extends TraceSpan {
	storagePath: KeyInfo;
	/**
	 * Id of the child spans.
	 */
	children: number[];
}

export interface TraceBlock {
	block_hash: string;
	tracing_targets: string;
	events: TraceEvent[];
	spans: TraceSpan[];
}

export interface PalletKeyInfo {
	module: string;
	item: string;
}

export interface SpecialKeyInfo {
	special: string;
}

export type KeyInfo = PalletKeyInfo | SpecialKeyInfo | { error: string };

export interface ParentSpanId {
	name: string;
	target: string;
	id: number;
}

export interface CurrencyId {
	symbol: string;
}

export interface StorageResourceId {
	pallet: string;
	item: string;
	field?: string;
}

export enum Phase {
	OnInitialze = 'on_initialize',
	ApplyExtrinsic = 'apply_extrinsic',
	OnFinalize = 'on_finalize',
	Other = 'Other',
}

/**
 * Gather info for a data associated with one primary span in a block execution phase.
 */
export interface PhaseTraceInfoGather {
	/**
	 * If this is apply_extrinsic, this will have the extrinsic index.
	 */
	extrinsicIndex?: BN;
	/**
	 * Phase in block execution
	 */
	phase: Phase;
	/**
	 * Careful, need to make sure we only have one primary span (e.g. apply_extrinsic)
	 */
	primarySpan: SpanWithChildren;
	/**
	 * For extrinsic execution this will be the actual extrinsic.
	 *
	 * I think this should only be one span but for now we will track multiple
	 */
	secondarySpans: SpanWithChildren[];
	/**
	 * Events from the primary span
	 */
	events: EventWithPhase[];
}

/**
 * Complete trace info for on_initialize / on_finalize
 */
export interface PhaseTraceInfoWithOps extends PhaseTraceInfoGather {
	/**
	 * Only account info events. These are used for operations
	 */
	accountInfoEvents: Map<string, EventWithAccountInfo[]>;
	// Operations, either will have phase or extrinsic index
	operations: Operation[];
}

export interface CurrencyId {
	symbol: string;
}

export interface StorageResourceId {
	pallet: string;
	item: string;
	field?: string;
}

export interface PhaseId {
	variant: Phase;
	applyExtrinsicIndex: BN;
}

interface TransitionOperationId {
	operationIndex: number;
	phase: PhaseId;
	parentSpanId?: ParentSpanId; // should be the same as parentSpanId for the associated event
	primarySpanId: ParentSpanId;
	eventIndex: number;
}

export interface Transition {
	id: Omit<TransitionOperationId, 'operationIndex'>;
	address: Address;
	storage: StorageResourceId;
	amount: {
		value: BN;
		currency: CurrencyId;
	};
}

export interface Operation extends Omit<Transition, 'id'> {
	id: TransitionOperationId;
}
