// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { AccountInfo, Address } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { IOption } from 'src/types/util';

export interface StringValues {
	key?: string;
	method?: 'Put' | 'Get';
	value_encoded?: string;
	result_encoded?: string;
	[i: string]: string | undefined;
}

export interface Data {
	stringValues: StringValues;
}

/**
 * Polymorphic super type of ParsedEvent & ParsedActionEvent & ParsedAccountEvent.
 *
 * The non-optional fields are what the trace event as returned by the RPC
 * contains.
 */
export interface TraceEvent {
	parentId: IOption<number>;
	target: string;
	data: Data;
	storagePath?: KeyInfo;
	parentSpanId?: ParentSpanId;
	eventIndex?: number;
	phase?: PhaseId;
	primarySpanId?: ParentSpanId;
	accountInfo?: AccountInfo;
	address?: Address;
}

/**
 * Parsed event.
 */
export interface ParsedEvent extends TraceEvent {
	storagePath: KeyInfo;
	parentSpanId?: ParentSpanId;
	eventIndex: number;
}

/**
 * Parsed event with info about the action group it belongs to.
 */
export interface ParsedActionEvent extends ParsedEvent {
	phase: PhaseId;
	primarySpanId: ParentSpanId;
}

/**
 * Parsed event of a `Get` from the `AccountInfo` storage item. Has info about
 * the action group it belongs to and the decoded `AccountInfo` storage item.
 */
export interface ParsedAccountEvent extends ParsedActionEvent {
	accountInfo: AccountInfo;
	address: Address;
}

export interface TraceSpan {
	id: number;
	name: string;
	parentId: IOption<number>;
	target: string;
	wasm: boolean;
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
	storageKeys: string;
	tracingTargets: string;
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
