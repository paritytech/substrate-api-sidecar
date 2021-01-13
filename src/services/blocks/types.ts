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
	// parentName?: string | string[];
	// keyName?: KeyInfo;
	// accountInfo?: any;
	// address?: any;
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

export interface KeyInfo {
	name: string;
	key: string;
}
