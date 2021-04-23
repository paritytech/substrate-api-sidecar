import { ApiPromise } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';
import { stringCamelCase } from '@polkadot/util';
import BN from 'bn.js';
import { InternalServerError } from 'http-errors';

import { IOption, isSome } from '../../../types/util';
import {
	ActionGroup,
	ActionGroupWithOps,
	BlockTrace,
	KeyInfo,
	Operation,
	PAccountEvent,
	PActionEvent,
	PalletKeyInfo,
	PEvent,
	Phase,
	SpanWithChildren,
	SpecialKeyInfo,
	TraceSpan,
} from './types';

const EMPTY_KEY_INFO = {
	error: 'key not found',
};

/**
 * Known spans
 */
const SPANS = {
	executeBlock: {
		name: 'execute_block',
		target: 'frame_executive',
	},
	applyExtrinsic: {
		name: 'apply_extrinsic',
		target: 'frame_executive',
	},
	onInitialize: {
		name: 'on_initialize',
		// Targets vary by pallet
	},
	onFinalize: {
		name: 'on_finalize',
		// Targets vary by pallet
	},
};

// TODO In the future this will need a more chain specific solution that creates
// keys directly from expanded metadata.
/**
 * Get all the storage key names based on the ones built into `api`.
 *
 * @param api ApiPromise
 */
function getKeyNames(api: ApiPromise): Record<string, KeyInfo> {
	const moduleKeys = Object.keys(api.query).reduce((acc, mod) => {
		Object.keys(api.query[mod]).forEach((item) => {
			const queryObj = api.query[mod][item];
			let key;
			try {
				// Slice off '0x' prefix
				key = queryObj.key().slice(2);
			} catch {
				key = queryObj.keyPrefix().slice(2);
			}

			acc[key] = {
				module: mod,
				item,
			};
		});

		return acc;
	}, {} as Record<string, KeyInfo>);

	const wellKnownKeys = {
		'3a636f6465': {
			special: ':code',
		},
		'3a686561707061676573': {
			special: ':heappages',
		},
		'3a65787472696e7369635f696e646578': {
			special: ':extrinsic_index',
		},
		'3a6368616e6765735f74726965': {
			special: ':changes_trie',
		},
		'3a6368696c645f73746f726167653a': {
			special: ':child_storage:',
		},
	};

	return { ...moduleKeys, ...wellKnownKeys };
}

// O(2n)
/**
 * Create a Map of span's `id` to the the span in format `SpanWithChildren`,
 * filling out each spans children as we go along
 *
 * @param spans spans to create a id => span mapping of.
 */
function getSpansById(spans: TraceSpan[]): Map<number, SpanWithChildren> {
	// Create a map so we can look up spans in constant time.
	const spansById = spans.reduce((acc, cur) => {
		const spanWithChildren = { ...cur, children: [] };
		acc.set(cur.id, spanWithChildren);
		return acc;
	}, new Map<number, SpanWithChildren>());

	// Go through each span, and add its Id to the `children` array of its
	// parent span, creating tree of spans starting with `execute_block` span as
	// the root.
	for (const span of spans) {
		if (!span.parentId) {
			continue;
		}

		if (!spansById.has(span.parentId)) {
			throw new Error('Expected spans parent to exist in spansById');
		}

		spansById.get(span.parentId)?.children.push(span.id);
	}

	return spansById;
}

// O(spans)
/**
 * Find the Ids of al the descendant spans of `root`
 *
 * @param root span which we want all the descendants of
 * @param spansById map of span id => span with children
 */
function findDescendants(
	root: number,
	spansById: Map<number, SpanWithChildren>
): number[] {
	// Note: traversal order doesn't matter here
	const stack = spansById.get(root)?.children;
	if (!stack) {
		return [];
	}

	const descendants = [];
	while (stack.length) {
		const curId = stack.pop();
		if (!curId) {
			break;
		}

		descendants.push(curId);

		const curSpanChildren = spansById.get(curId)?.children;
		curSpanChildren && stack.push(...curSpanChildren);
	}

	return descendants;
}

// O(events)
/**
 * Map events by their parent span Id.
 *
 * @param events parsed events.
 * @returns Mapping of spanId => events[].
 */
function getEventsByParentId(events: PEvent[]): Map<number, PEvent[]> {
	return events.reduce((acc, cur) => {
		if (!acc.has(cur.parentId)) {
			acc.set(cur.parentId, [cur]);
		} else {
			acc.get(cur.parentId)?.push(cur);
		}

		return acc;
	}, new Map<number, PEvent[]>());
}

// O(spanIds)
/**
 * Extract extrinsic indexes from all :extrinsic_index storage item read events.
 *
 * @param spanIds List of spanIds to check for extrinsicIndex
 * @param extrinsicIndexBySpanId Map of spanId => extrinsicIndex
 * @returns
 */
function extractExtrinsicIndex(
	spanIds: number[],
	extrinsicIndexBySpanId: Map<number, BN>
): BN {
	// There are typically multiple reads of extrinsic index when applying an extrinsic,
	// So we get all of those reads, which should all be the same number.
	const extrinsicIndex = spanIds.reduce((acc, id) => {
		if (!extrinsicIndexBySpanId.has(id)) {
			return acc;
		}

		acc.push(extrinsicIndexBySpanId.get(id) as BN);
		return acc;
	}, [] as BN[]);

	if (extrinsicIndex.length === 0) {
		throw new InternalServerError('Expected at least one extrinsic index');
	}

	if (extrinsicIndex.length > 1) {
		// If there are multiple reads we need to check that they are all the same
		for (const [i, extIdx] of extrinsicIndex.entries()) {
			if (i > 0 && !extrinsicIndex[i]?.eq(extIdx)) {
				throw new Error(
					'Expect extrinsic to only be applied at a single index.'
				);
			}
		}
	}

	return extrinsicIndex[0];
}

/**
 * Assumptions:
 * - Spans do not start in sorted order.
 * - Events start in sorted order.
 */
export class Trace {
	/**
	 * Known storage keys.
	 */
	private keyNames;
	constructor(
		api: ApiPromise,
		private traceBlock: BlockTrace,
		private registry: Registry
	) {
		if (!traceBlock.spans.length) {
			throw new InternalServerError(
				'No spans found. This runtime is likely not supported with tracing.'
			);
		}

		this.keyNames = getKeyNames(api);
	}

	/**
	 * Derive the action groups and operations from the block trace.
	 *
	 * @returns the action groups and opertions
	 */
	actionsAndOps(): { actions: ActionGroup[]; operations: Operation[] } {
		const spansById = getSpansById(this.traceBlock.spans);
		const { events, extrinsicIndexBySpanId } = this.parseEvents(spansById);
		const eventsByParentId = getEventsByParentId(events);
		const spansWithChildren = [...spansById.values()];
		// find execute block span
		const executeBlockSpan = spansWithChildren.find(
			({ name, target }) =>
				SPANS.executeBlock.name === name && SPANS.executeBlock.target === target
		);
		if (!executeBlockSpan) {
			throw new InternalServerError('execute_block span could not be found');
		}

		const operations: Operation[] = [];
		const actions: ActionGroup[] = [];
		for (const primary of spansWithChildren.sort((a, b) => a.id - b.id)) {
			if (!(primary.parentId === executeBlockSpan.id)) {
				// Only use primary spans (spans where parentId === execute_block). All other
				// spans are either the executeBlockSpan or descendant of a primary span.
				continue;
			}

			// Gather the secondary spans and there events. Events are useful for
			// creating Operations. Spans are usefult for attributing events to a
			// hook or extrinsic.
			const secondarySpansIds = findDescendants(primary.id, spansById);
			const secondarySpansEvents: PEvent[] = [];
			const secondarySpans: SpanWithChildren[] = [];
			secondarySpansIds.forEach((id) => {
				const events = eventsByParentId.get(id);
				const span = spansById.get(id);

				events && secondarySpansEvents.push(...events);
				span && secondarySpans.push(span);
			});

			let phase: Phase | string, extrinsicIndex: BN | undefined;
			if (primary.name === SPANS.applyExtrinsic.name) {
				// This is an action group for an extrinsic application
				extrinsicIndex = extractExtrinsicIndex(
					// Pass in all the relevant spanIds of this action group
					secondarySpansIds.concat(primary.id),
					extrinsicIndexBySpanId
				);

				phase = Phase.ApplyExtrinsic;
			} else {
				// This likely an action group for a pallet hook or some initial
				// block execution checks.

				// TODO can we make an assumption about how many secondary spans there are?
				// i.e. is it safe to always use the first span to check the phase?

				if (secondarySpans[0]?.name === SPANS.onInitialize.name) {
					phase = Phase.OnInitialze;
				} else if (secondarySpans[0]?.name === SPANS.onFinalize.name) {
					phase = Phase.OnFinalize;
				} else {
					// If this is not a documented phase, it likely has to do with execution initialization
					// or finalization.
					phase =
						(secondarySpans[0] &&
							// Use camelCase for consistency
							stringCamelCase(secondarySpans[0]?.name)) ||
						stringCamelCase(primary.name);
				}
			}

			const primarySpanEvents = eventsByParentId.get(primary.id);
			const events =
				primarySpanEvents
					?.concat(secondarySpansEvents)
					.sort((a, b) => a.eventIndex - b.eventIndex) || [];

			const eventsWithPhaseInfo = events.map((e) => {
				return {
					...e,
					phase: {
						variant: phase,
						applyExtrinsicIndex: extrinsicIndex,
					},
					primarySpanId: {
						id: primary.id,
						name: primary.name,
						target: primary.target,
					},
				};
			});

			operations.push(
				...this.deriveOperations(
					this.accountEventsByAddress(eventsWithPhaseInfo)
				)
			);

			// Get a primary span, and all associated descendant spans and events
			actions.push({
				extrinsicIndex,
				phase,
				primarySpan: primary,
				secondarySpans,
				events: eventsWithPhaseInfo,
			});
		}

		return { actions, operations };
	}

	private extractIndex(event: PEvent): IOption<BN> {
		if (
			!(
				(event.storagePath as SpecialKeyInfo)?.special === ':extrinsic_index' &&
				event.data.stringValues.method == 'Get'
			)
		) {
			// Note: there are many read and writes of extrinsic_index per extrinsic so take care
			// when modifying this logic
			// Note: we only consider `Get`, `Put` ops are prep for next extrinsic
			return null;
		}

		const indexEncodedOption = event.data.stringValues.result;
		if (!(typeof indexEncodedOption == 'string')) {
			throw new InternalServerError(
				'Expected there to be an encoded extrinsic index for extrinsic index event'
			);
		}

		const scale = indexEncodedOption
			.slice(2) // Slice of leading option bits beacus they cause trouble
			.match(/.{1,2}/g) // Reverse the order of the bytes for correct endian-ness
			?.reverse()
			.join('');
		const hex = `0x${scale || ''}`;

		return this.registry.createType('u32', hex).toBn();
	}

	private parseEvents(
		spansById: Map<number, SpanWithChildren>
	): { events: PEvent[]; extrinsicIndexBySpanId: Map<number, BN> } {
		const extrinsicIndexBySpanId = new Map<number, BN>();

		const events = this.traceBlock.events.map((e, idx) => {
			const { key } = e.data.stringValues;
			const keyPrefix = key?.slice(0, 64);
			const storagePath = this.getStoragePathFromKey(keyPrefix);

			const p = spansById.get(e.parentId);
			const parentSpanId = p && {
				name: p.name,
				target: p.target,
				id: p.id,
			};

			const annotated = { ...e, storagePath, parentSpanId, eventIndex: idx };
			const extrinsicIndex = this.extractIndex(annotated);
			if (isSome(extrinsicIndex)) {
				extrinsicIndexBySpanId.set(annotated.parentId, extrinsicIndex);
			}

			return annotated;
		});

		return { events, extrinsicIndexBySpanId };
	}

	/**
	 * Create a mapping adress => Account events for that address based on an
	 * array of all the events.
	 *
	 * This mapping is useful because we create operations based on consequetive
	 * reads/writes to a single accounts balance data.
	 *
	 * Note: Assume passed in events are already sorted.
	 *
	 * @param events events with phase info
	 * @returns
	 */
	accountEventsByAddress(events: PActionEvent[]): Map<string, PAccountEvent[]> {
		return events.reduce((acc, cur) => {
			if (
				!(
					(cur.storagePath as PalletKeyInfo).module == 'system' &&
					(cur.storagePath as PalletKeyInfo).item == 'account'
				)
			) {
				// filter out non system::account events
				return acc;
			}

			const asAccount = this.toAccountEvent(cur);
			const address = asAccount.address.toString();

			if (!acc.has(address)) {
				acc.set(address, [asAccount]);
			} else {
				acc.get(address)?.push(asAccount);
			}

			return acc;
		}, new Map<string, PAccountEvent[]>());
	}

	/**
	 * Convert an `EventWithPhase` to a `EventWithAccountInfo`. Will throw if event
	 * does not have system::account storagePath
	 *
	 * @param event EventAnnotated
	 */
	private toAccountEvent(event: PActionEvent): PAccountEvent {
		const { storagePath } = event;
		if (
			!(
				(storagePath as PalletKeyInfo).module == 'system' &&
				(storagePath as PalletKeyInfo).item == 'account'
			)
		) {
			throw new Error('Event did not have system::account path as expected');
		}

		// key = h(system) + h(account) + h(address) + address
		// Since this is a transparent key with the address at the end we can pull out
		// the address from the key. Here we slice off the storage key + account hash.
		const addressRaw = event.data.stringValues.key?.slice(96);
		if (!(typeof addressRaw === 'string')) {
			throw new InternalServerError(
				'Expect encoded address in system::account event storage key'
			);
		}
		const address = this.registry.createType('Address', `0x${addressRaw}`);

		const accountInfoEncoded = event?.data?.stringValues?.result;
		if (!(typeof accountInfoEncoded === 'string')) {
			throw Error(
				'Expect accountInfoEncoded to always be a string in system::Account event'
			);
		}
		const accountInfo = (this.registry.createType(
			'AccountInfo',
			`0x${accountInfoEncoded.slice(2)}` // cutting off the Option byte
		) as unknown) as AccountInfo;

		return { ...event, accountInfo, address };
	}

	private deriveOperations(
		accountEventsByAddress: Map<string, PAccountEvent[]>
	): Operation[] {
		const ops = [];
		for (const events of accountEventsByAddress.values()) {
			for (const [i, e] of events.entries()) {
				if (i === 0) {
					// Skip the first event; we always compare previous event <=> current event.
					continue;
				}

				const prev = events[i - 1].accountInfo.data;
				const cur = e.accountInfo.data;

				const free = cur.free.sub(prev.free);
				const reserved = cur.reserved.sub(prev.reserved);
				const miscFrozen = cur.miscFrozen.sub(prev.miscFrozen);
				const feeFrozen = cur.feeFrozen.sub(prev.feeFrozen);

				// Information that will go into any operation we create.
				const baseInfo = {
					phase: e.phase,
					parentSpanId: e.parentSpanId,
					primarySpanId: e.primarySpanId,
					eventIndex: e.eventIndex,
					address: e.address,
				};
				const currency = {
					// For now we assume everything is always in the same token
					symbol: this.registry.chainTokens[0],
				};
				// Base information for all `storage` values
				const systemAccountData = {
					pallet: 'system',
					item: 'Account',
					field1: 'data',
				};

				if (!free.eqn(0)) {
					ops.push({
						...baseInfo,
						storage: {
							...systemAccountData,
							field2: 'free',
						},
						amount: {
							value: free,
							currency,
						},
					});
				}
				if (!reserved.eqn(0)) {
					ops.push({
						...baseInfo,
						storage: {
							...systemAccountData,
							field2: 'reserved',
						},
						amount: {
							value: reserved,
							currency,
						},
					});
				}
				if (!miscFrozen.eqn(0)) {
					ops.push({
						...baseInfo,
						storage: {
							...systemAccountData,
							field2: 'miscFrozen',
						},
						amount: {
							value: miscFrozen,
							currency,
						},
					});
				}
				if (!feeFrozen.eqn(0)) {
					ops.push({
						...baseInfo,
						storage: {
							...systemAccountData,
							field2: 'feeFrozen',
						},
						amount: {
							value: feeFrozen,
							currency,
						},
					});
				}
			}
		}

		return ops;
	}

	/**
	 *Extract the storage item name based on the key prefix.
	 *
	 * @param key hex encoded storage key
	 * @returns KeyInfo
	 */
	private getStoragePathFromKey(key?: string): KeyInfo {
		return (
			((key && this.keyNames[key?.slice(0, 64)]) as KeyInfo) || EMPTY_KEY_INFO
		);
	}
}
