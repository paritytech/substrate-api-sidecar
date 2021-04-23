import { AccountInfo, Address } from '@polkadot/types/interfaces';
import BN from 'bn.js';

export interface StringValues {
	key?: string;
	method?: 'Put' | 'Get';
	result?: string;
	[i: string]: unknown;
}

export interface Data {
	stringValues: StringValues;
}

export interface TraceEvent {
	name: string;
	parentId: number;
	target: string;
	data: Data;
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
	name: string;
	parentId: number;
	target: string;
	data: Data;
}

/**
 * Span with direct descendants
 */
export interface SpanWithChildren extends TraceSpan {
	/**
	 * Id of the child spans.
	 */
	children: number[];
}

export interface BlockTrace {
	blockHash: string;
	tracingTargets: string;
	events: TraceEvent[];
	spans: TraceSpan[];
}

export function isBlockTrace(
	thing: unknown
): thing is { blockTrace: BlockTrace } {
	return (
		typeof (thing as { blockTrace: BlockTrace })?.blockTrace.blockHash ===
			'string' &&
		typeof (thing as { blockTrace: BlockTrace })?.blockTrace.tracingTargets ===
			'string' &&
		Array.isArray((thing as { blockTrace: BlockTrace })?.blockTrace.events) &&
		Array.isArray((thing as { blockTrace: BlockTrace })?.blockTrace.spans)
	);
}

export interface TraceError {
	error: string;
}

export function isTraceError(
	thing: unknown
): thing is { traceError: TraceError } {
	return (
		typeof (thing as { traceError: TraceError })?.traceError?.error === 'string'
	);
}

export type BlockTraceResponse =
	| { traceError: TraceError }
	| { blockTrace: BlockTrace };

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
	/**
	 * field1 is nested in item.
	 */
	field1: string;
	/**
	 * field2 is nested in field1
	 */
	field2: string;
}

export enum Phase {
	OnInitialze = 'onInitialize',
	ApplyExtrinsic = 'applyExtrinsic',
	OnFinalize = 'onFinalize',
}

export type PhaseOther = Phase | string;

/**
 * TODO this should be renamed `ActionGroup`
 * Gather info for a data associated with one primary span in a block execution phase.
 */
export interface ActionGroup {
	/**
	 * If this is apply_extrinsic, this will have the extrinsic index.
	 */
	extrinsicIndex?: BN;
	/**
	 * Phase in block execution
	 */
	phase: PhaseOther;
	/**
	 * Careful, need to make sure we only have one primary span (e.g. apply_extrinsic)
	 */
	primarySpan: SpanWithChildren;
	/**
	 * For extrinsic execution this will the actual extrinsic + any nested calls.
	 * For onInitialize/onFinalize
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
export interface ActionGroupWithOps extends ActionGroup {
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
	variant: PhaseOther;
	applyExtrinsicIndex: BN;
}

export interface Operation {
	phase: PhaseId;
	parentSpanId?: ParentSpanId; // should be the same as parentSpanId for the associated event
	primarySpanId: ParentSpanId;
	eventIndex: number;
	address: Address;
	storage: StorageResourceId;
	amount: {
		value: BN;
		currency: CurrencyId;
	};
}
