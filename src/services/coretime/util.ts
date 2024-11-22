import { StorageKey } from '@polkadot/types';
import {
	PalletBrokerConfigRecord,
	PalletBrokerLeaseRecordItem,
	PalletBrokerPotentialRenewalId,
	PalletBrokerPotentialRenewalRecord,
	PalletBrokerRegionId,
	PalletBrokerRegionRecord,
	PalletBrokerSaleInfoRecord,
	PalletBrokerScheduleItem,
	PalletBrokerStatusRecord,
} from '@polkadot/types/lookup';
import { Option, U32, Vec } from '@polkadot/types-codec';
import { BN } from '@polkadot/util';

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

export type TWorkloadInfo = {
	core: number;
	info: {
		isPool: boolean;
		isTask: boolean;
		mask: string;
		task: string;
	}[];
};

export function extractWorkloadInfo(info: Vec<PalletBrokerScheduleItem>, core: StorageKey<[U32]>): TWorkloadInfo {
	const workloadInfo = core.args[0];
	return {
		core: workloadInfo.toNumber(),
		info: info.map((c) => ({
			isPool: c.assignment.isPool,
			isTask: c.assignment.isTask,
			mask: c.mask.toHex(),
			task: c.assignment.isTask ? c.assignment.asTask.toString() : c.assignment.isPool ? 'Pool' : 'Idle',
		})),
	};
}

export type TWorkplanInfo = {
	core: number;
	timeslice: number;
	info: {
		isPool: boolean;
		isTask: boolean;
		mask: string;
		task: string;
	}[];
};

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

export type TReservationInfo = {
	mask: string;
	task: string;
};

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

export type TPotentialRenewalInfo = {
	completion?: string;
	core: number;
	mask: string | null;
	price?: BN;
	task: string;
	when: number;
};

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

export type TLeaseInfo = {
	task: string;
	until: number;
};

export function extractLeaseInfo(info: PalletBrokerLeaseRecordItem, core?: number): TLeaseInfo {
	return {
		...(core ? { core } : {}),
		task: info.task.toString(),
		until: info.until.toNumber(),
	};
}

export type TSaleInfo = {
	saleStart: number;
	leadinLength: number;
	endPrice: BN;
	regionBegin: number;
	regionEnd: number;
	idealCoresSold: number;
	coresOffered: number;
	firstCore: number;
	selloutPrice?: BN;
	coresSold: number;
};

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

export type TStatusInfo = {
	coreCount?: number;
	privatePoolSize?: number;
	systemPoolSize?: number;
	lastCommittedTimeslice?: number;
	lastTimeslice?: number;
};

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

export type TRegionInfo = {
	core: number;
	begin: number;
	end?: number;
	owner?: string;
	paid?: number;
	mask: string;
};

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

export type TConfigInfo = {
	advanceNotice: number;
	interludeLength: number;
	leadinLength: number;
	regionLength: number;
	idealBulkProportion: number;
	limitCoresOffered?: number;
	renewalBump: number;
	contributionTimeout: number;
};

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
