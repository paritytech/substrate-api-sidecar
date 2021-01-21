import { Address } from '@polkadot/types/interfaces';
import * as BN from 'bn.js';

export interface BoolValues {
	[i: string]: unknown;
}

export interface I64Values {
	[i: string]: unknown;
}

export interface StringValues {
	key?: string;
	method?: 'Put' | 'Get';
	result?: unknown;
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

export interface TraceSpan {
	id: number;
	line: number;
	name: string;
	overal_time: {
		nanos: number;
		secs: number;
	};
	parent_id: number;
	target: string;
	values: Values;
	// parentName?: string;
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

export interface Transition {
	parentSpanId: ParentSpanId[];
	eventIndex: number;
	address: Address;
	storage: StorageResourceId;
	amount: {
		value: BN;
		currency: CurrencyId;
	};
}

export interface Operation
	extends Omit<Transition, 'parentSpanId' | 'eventIndex'> {
	operationId: {
		operationIndex: number;
		phase: {
			onInitialize?: boolean;
			onFinalize?: boolean;
			// extrinsic index
			extrinsic?: number;
		};
		parentSpanId: ParentSpanId[];
		eventIndex: number;
	};
}
