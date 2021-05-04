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

/**
 * Parsed event.
 */
export interface PEvent extends TraceEvent {
	storagePath: KeyInfo;
	parentSpanId?: ParentSpanId;
	eventIndex: number;
}

/**
 * Parsed event with info about the action group it belongs to.
 */
export interface PActionEvent extends PEvent {
	phase: PhaseId;
	primarySpanId: ParentSpanId;
}

/**
 * Parsed event of a `Get` from the `AccountInfo` storage item. Has info about
 * the action group it belongs to and the decoded `AccountInfo` storage item.
 */
export interface PAccountEvent extends PActionEvent {
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
	 * Ids of the child spans.
	 */
	children: number[];
}

export interface BlockTrace {
	blockHash: string;
	storageKeys: string;
	tracingTargets: string;
	events: TraceEvent[];
	spans: TraceSpan[];
}

export function isBlockTrace(
	thing: unknown
): thing is { blockTrace: BlockTrace } {
	return (
		typeof (thing as { blockTrace: BlockTrace })?.blockTrace?.blockHash ===
			'string' &&
		typeof (thing as { blockTrace: BlockTrace })?.blockTrace?.tracingTargets ===
			'string' &&
		typeof (thing as { blockTrace: BlockTrace })?.blockTrace?.storageKeys ===
			'string' &&
		Array.isArray((thing as { blockTrace: BlockTrace })?.blockTrace?.events) &&
		Array.isArray((thing as { blockTrace: BlockTrace })?.blockTrace?.spans)
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
	 * field1 is a nested field in item.
	 */
	field1: string;
	/**
	 * field2 is nested in field1
	 */
	field2: string;
}

export enum Phase {
	OnInitialze = 'onInitialize',
	InitialChecks = 'initialChecks',
	ApplyExtrinsic = 'applyExtrinsic',
	OnFinalize = 'onFinalize',
	FinalChecks = 'finalChecks',
}

export type PhaseOther = Phase | string;

/**
 * Information on an action group.
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
	 * Primary span is a direct descendant `executeBlock` span. Secondary spans are
	 * a descendants of the primary span. (Secondary spans can be a descendant of
	 * arbitrary depth.)
	 */
	primarySpan: SpanWithChildren;
	/**
	 * Descendant spans of a primary span.
	 *
	 * For extrinsic application this will be the actual extrinsic + any nested calls.
	 *
	 * For hooks this will be something be the `onInitialize`/`onFinalize` span.
	 */
	secondarySpans: SpanWithChildren[];
	/**
	 * Events from the primary and secondary spans.
	 */
	events: PActionEvent[];
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
	extrinsicIndex?: BN;
}

export interface Operation {
	phase: PhaseId;
	parentSpanId?: ParentSpanId;
	primarySpanId: ParentSpanId;
	/**
	 * Index of the underlying trace event.
	 */
	eventIndex: number;
	address: Address;
	storage: StorageResourceId;
	amount: {
		value: BN;
		currency: CurrencyId;
	};
}
