// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { BN } from '@polkadot/util';

import { IAt } from '.';

export type TWorkloadInfo = {
	core: number;
	info: {
		isPool: boolean;
		isTask: boolean;
		mask: string;
		task: string;
	};
};

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

export type TReservationInfo = {
	mask: string;
	task: string;
};

export type TPotentialRenewalInfo = {
	completion?: string;
	core: number;
	mask: string | null;
	price?: BN;
	task: string;
	when: number;
};

export type TLeaseInfo = {
	task: string;
	until: number;
};

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

export type TStatusInfo = {
	coreCount?: number;
	privatePoolSize?: number;
	systemPoolSize?: number;
	lastCommittedTimeslice?: number;
	lastTimeslice?: number;
};

export type TRegionInfo = {
	core: number;
	begin: number;
	end?: number;
	owner?: string;
	paid?: number;
	mask: string;
};

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

export interface CoreDescriptorAssignment {
	task: string;
	ratio: number;
	remaining: number;
	isTask: boolean;
	isPool: boolean;
}

export type TCoreDescriptor = {
	info: {
		currentWork: {
			assignments: CoreDescriptorAssignment[];
			endHint: BN | null;
			pos: number;
			step: number;
		};
		queue: {
			first: BN;
			last: BN;
		};
	};
};

export interface LeaseWithCore extends TLeaseInfo {
	core: number;
}
export type TParaLifecycle = {
	paraId: number;
	type: string | null;
};

export interface ICoretimeLeases {
	at: IAt;
	leases: LeaseWithCore[];
}

export interface ICoretimeRegions {
	at: IAt;
	regions: TRegionInfo[];
}

export interface ICoretimeRenewals {
	at: IAt;
	renewals: TPotentialRenewalInfo[];
}

export interface ICoretimeReservations {
	at: IAt;
	reservations: TReservationInfo[];
}

export interface ICoretimeRelayInfo {
	at: IAt;
	brokerId?: number;
	palletVersion?: number;
	maxHistoricalRevenue?: number;
}

export interface ICoretimeChainInfo {
	at: IAt;
	configuration?: Pick<TConfigInfo, 'regionLength' | 'interludeLength' | 'leadinLength'> & {
		relayBlocksPerTimeslice: number;
	};
	status?: TStatusInfo;
	currentRegion?: {
		start: number | null;
		end: number | null;
	};
	cores: {
		available: number;
		sold: number;
		total: number;
		currentCorePrice: BN;
		selloutPrice?: BN;
		firstCore?: number;
	};
	phase: {
		config: {
			phaseName: string;
			lastRelayBlock: number;
			lastTimeslice: number;
		}[];
		currentPhase: string;
	};
}

export interface ICoretimeCores {
	at: IAt;
	cores?: (
		| {
				coreId: string;
				taskId: string;
				workload: TWorkloadInfo['info'];
				type: {
					condition: string;
					details?:
						| {
								mask?: string;
						  }
						| {
								until?: number;
						  };
				};
				regions: TRegionInfo[];
		  }
		| (TParaLifecycle & TCoreDescriptor)
	)[];
	coreSchedules?: Record<string, unknown>[];
}
