import { StorageKey } from '@polkadot/types';
import { ParaId } from '@polkadot/types/interfaces';
import {
	PalletBrokerConfigRecord,
	PalletBrokerCoretimeInterfaceCoreAssignment,
	PalletBrokerLeaseRecordItem,
	PalletBrokerPotentialRenewalId,
	PalletBrokerPotentialRenewalRecord,
	PalletBrokerRegionId,
	PalletBrokerRegionRecord,
	PalletBrokerSaleInfoRecord,
	PalletBrokerScheduleItem,
	PalletBrokerStatusRecord,
	PolkadotRuntimeParachainsAssignerCoretimeAssignmentState,
	PolkadotRuntimeParachainsAssignerCoretimeCoreDescriptor,
	PolkadotRuntimeParachainsAssignerCoretimeQueueDescriptor,
	PolkadotRuntimeParachainsAssignerCoretimeWorkState,
	PolkadotRuntimeParachainsParasParaLifecycle,
} from '@polkadot/types/lookup';
import { Option, Vec } from '@polkadot/types-codec';
import { AnyTuple } from '@polkadot/types-codec/types';
import { BN } from '@polkadot/util';

import {
	TConfigInfo,
	TCoreDescriptor,
	TLeaseInfo,
	TParaLifecycle,
	TPotentialRenewalInfo,
	TRegionInfo,
	TReservationInfo,
	TSaleInfo,
	TStatusInfo,
	TWorkloadInfo,
	TWorkplanInfo,
} from '../../types/responses';

export function sortByCore<T extends { core: number }>(dataArray?: T | T[]): T[] {
	if (!dataArray) {
		return [];
	}

	const sanitized = Array.isArray(dataArray) ? dataArray : [dataArray];

	return sanitized.sort((a, b) => a.core - b.core);
}

export function hexToBin(hex: string): string {
	return parseInt(hex, 16).toString(2);
}

export function processHexMask(mask: PalletBrokerScheduleItem['mask'] | undefined): string[] {
	if (!mask) {
		return [];
	}

	const trimmedHex: string = mask.toHex().slice(2);
	const arr: string[] = trimmedHex.split('');
	const buffArr: string[] = [];

	arr.forEach((bit) => {
		hexToBin(bit)
			.split('')
			.forEach((v) => buffArr.push(v));
	});
	buffArr.filter((v) => v === '1');

	return buffArr;
}

export function extractWorkloadInfo(info: Vec<PalletBrokerScheduleItem>, core: number): TWorkloadInfo {
	return {
		core,
		info: info.map((c) => ({
			isPool: c.assignment.isPool,
			isTask: c.assignment.isTask,
			mask: c.mask.toHex(),
			task: c.assignment.isTask ? c.assignment.asTask.toString() : c.assignment.isPool ? 'Pool' : 'Idle',
		}))[0],
	};
}

export function extractWorkplanInfo(
	info: Option<Vec<PalletBrokerScheduleItem>>,
	core: number,
	timeslice: number,
): TWorkplanInfo {
	const workplanInfo = info.isSome ? info.unwrap() : [];

	return {
		core: core,
		timeslice: timeslice,
		info: workplanInfo?.map((c) => ({
			mask: c.mask.toHex(),
			isPool: c.assignment.isPool,
			isTask: c.assignment.isTask,
			task: c.assignment.isTask ? c.assignment.asTask.toString() : c.assignment.isPool ? 'Pool' : 'Idle',
		})),
	};
}

export function extractReservationInfo(info: PalletBrokerScheduleItem[]): TReservationInfo {
	return {
		mask: info[0]?.mask.toHex(),
		task: info[0]?.assignment?.isTask
			? info[0]?.assignment?.asTask.toString()
			: info[0]?.assignment?.isPool
				? 'Pool'
				: '',
	};
}

export function extractPotentialRenewalInfo(
	info: Option<PalletBrokerPotentialRenewalRecord>,
	item: StorageKey<[PalletBrokerPotentialRenewalId]>,
): TPotentialRenewalInfo {
	const unwrapped: PalletBrokerPotentialRenewalRecord | null = info.isSome ? info.unwrap() : null;
	let mask: string | null = null;
	let task = '';

	const completion = unwrapped?.completion;

	if (completion?.isComplete) {
		const complete = completion?.asComplete[0];

		task = complete.assignment.isTask
			? complete?.assignment.asTask.toString()
			: complete?.assignment.isPool
				? 'Pool'
				: 'Idle';
		mask = complete.mask.toHex();
	} else if (completion?.isPartial) {
		mask = completion?.asPartial.toHex();
		task = '';
	} else {
		mask = null;
	}

	return {
		completion: completion?.type,
		core: item.args[0].core.toNumber(),
		mask,
		price: unwrapped?.price.toBn(),
		task,
		when: item.args[0].when.toNumber(),
	};
}

export function extractLeaseInfo(info: PalletBrokerLeaseRecordItem, core?: number): TLeaseInfo {
	return {
		...(core ? { core } : {}),
		task: info.task.toString(),
		until: info.until.toNumber(),
	};
}

export function extractSaleInfo(info: PalletBrokerSaleInfoRecord): TSaleInfo {
	return {
		saleStart: info.saleStart.toNumber(),
		leadinLength: info.leadinLength.toNumber(),
		endPrice: info.endPrice.toBn(),
		regionBegin: info.regionBegin.toNumber(),
		regionEnd: info.regionEnd.toNumber(),
		idealCoresSold: info.idealCoresSold.toNumber(),
		coresOffered: info.coresOffered.toNumber(),
		firstCore: info.firstCore.toNumber(),
		selloutPrice: info.selloutPrice.isSome ? info.selloutPrice.unwrapOr(undefined)?.toBn() : undefined,
		coresSold: info.coresSold.toNumber(),
	};
}

export function extractStatusInfo(info: Option<PalletBrokerStatusRecord>): TStatusInfo {
	const unwrapped: PalletBrokerStatusRecord | null = info.isSome ? info.unwrap() : null;

	return {
		coreCount: unwrapped?.coreCount.toNumber(),
		privatePoolSize: unwrapped?.privatePoolSize.toNumber(),
		systemPoolSize: unwrapped?.systemPoolSize.toNumber(),
		lastCommittedTimeslice: unwrapped?.lastCommittedTimeslice.toNumber(),
		lastTimeslice: unwrapped?.lastTimeslice.toNumber(),
	};
}

export function extractRegionInfo(
	info: [StorageKey<[PalletBrokerRegionId]>, Option<PalletBrokerRegionRecord>],
): TRegionInfo {
	const regionInfo = info[0].args[0];
	const value = info[1].isSome ? info[1].unwrap() : null;
	return {
		core: regionInfo.core.toNumber(),
		begin: regionInfo.begin.toNumber(),
		end: value?.end.toNumber(),
		owner: value?.owner.toString(),
		paid: value?.paid.isSome ? value?.paid.unwrap().toNumber() : undefined,
		mask: regionInfo.mask.toHex(),
	};
}

export function extractConfigInfo(info: Option<PalletBrokerConfigRecord>): TConfigInfo {
	return {
		advanceNotice: info.unwrap().advanceNotice.toNumber(),
		interludeLength: info.unwrap().interludeLength.toNumber(),
		leadinLength: info.unwrap().leadinLength.toNumber(),
		regionLength: info.unwrap().regionLength.toNumber(),
		idealBulkProportion: info.unwrap().idealBulkProportion.toNumber(),
		limitCoresOffered: info.unwrap().limitCoresOffered.unwrapOr(undefined)?.toNumber(),
		renewalBump: info.unwrap().renewalBump.toNumber(),
		contributionTimeout: info.unwrap().contributionTimeout.toNumber(),
	};
}

export function extractCoreDescriptorInfo(
	_key: StorageKey<AnyTuple>,
	info: PolkadotRuntimeParachainsAssignerCoretimeCoreDescriptor,
): TCoreDescriptor {
	const currentWork: PolkadotRuntimeParachainsAssignerCoretimeWorkState | null = info?.currentWork.isSome
		? info.currentWork.unwrap()
		: null;
	const queue: PolkadotRuntimeParachainsAssignerCoretimeQueueDescriptor | null = info?.queue.isSome
		? info.queue.unwrap()
		: null;
	const assignments = currentWork?.assignments || [];
	return {
		info: {
			currentWork: {
				assignments: assignments?.map(
					(
						assgn: [
							PalletBrokerCoretimeInterfaceCoreAssignment,
							PolkadotRuntimeParachainsAssignerCoretimeAssignmentState,
						],
					) => {
						return {
							isPool: assgn[0]?.isPool,
							isTask: assgn[0]?.isTask,
							ratio: assgn[1]?.ratio.toNumber(),
							remaining: assgn[1]?.remaining.toNumber(),
							task: assgn[0]?.isTask ? assgn[0]?.asTask.toString() : assgn[0]?.isPool ? 'Pool' : 'Idle',
						};
					},
				),
				endHint: currentWork?.endHint.isSome ? currentWork?.endHint?.unwrap().toBn() : null,
				pos: currentWork?.pos.toNumber() || 0,
				step: currentWork?.step.toNumber() || 0,
			},
			queue: {
				first: queue?.first.toBn() || new BN(0),
				last: queue?.last.toBn() || new BN(0),
			},
		},
	};
}

export function extractParachainLifecycleInfo(
	key: StorageKey<[ParaId]>,
	val: Option<PolkadotRuntimeParachainsParasParaLifecycle>,
): TParaLifecycle {
	return {
		paraId: key.args[0].toNumber(),
		type: val.isSome ? val.unwrap().toString() : null,
	};
}
