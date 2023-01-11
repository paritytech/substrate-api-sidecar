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

import { Compact, Option } from '@polkadot/types/codec';
import {
	AccountId,
	BalanceOf,
	BlockNumber,
	Digest,
	FundInfo,
	H256,
	Hash,
	ParaId,
	ParaLifecycle,
} from '@polkadot/types/interfaces';
import { AbstractInt } from '@polkadot/types-codec/abstract';
import BN from 'bn.js';

import { IOption } from '../util';
import { IAt } from './';

export type AuctionPhase = 'startPeriod' | 'endPeriod' | 'vrfDelay';

export type ParaType = 'parachain' | 'parathread';

export interface IFund {
	/**
	 * Id of the parachain or parathread that has a crowdloan.
	 */
	paraId: ParaId;
	/**
	 * `FundInfo` for the para's crowdloan. Use query param `fundInfo=true` to include the `FundInfo`.
	 * Inclusion may make the query take longer.
	 */
	fundInfo: Option<FundInfo>;
}

export interface ICrowdloansInfo {
	at: IAt;
	/**
	 * `FundInfo` describing the crowdloan, or null if none could be found.
	 */
	fundInfo: IOption<FundInfo>;
	/**
	 * Lease period indexes that the crowdloan applys to.
	 */
	leasePeriods?: number[];
}

export interface ICrowdloans {
	at: IAt;
	/**
	 * List of all crowdloans.
	 */
	funds: IFund[];
}

export interface LeaseFormatted {
	/**
	 * Lease period. The `leasePeriodIndex` can be null when the current block now,
	 * substracted by the offset is less than zero.
	 */
	leasePeriodIndex: number | null;
	/**
	 * Amount held on deposit for the lease period.
	 */
	deposit: BalanceOf;
	/**
	 * Account responsible for the lease.
	 */
	account: AccountId;
}

export interface ILeaseInfo {
	at: IAt;
	/**
	 * Lifecycle of the para (i.e Onboarding, Parathread, Offboarding etc).
	 */
	paraLifecycle: Option<ParaLifecycle>;
	/**
	 * If the para is in the onboarding phase, this will say if it is onboarding as
	 * a `parachain` or a `parathread`; otherwise it this field is not included in the response.
	 */
	onboardingAs?: ParaType;
	/**
	 * List of current and upcoming leases this para has.
	 */
	leases: IOption<LeaseFormatted[]>;
}

/**
 * `auctions::WinningData` expressed as an object.
 */
export interface IWinningData {
	accountId: AccountId;
	paraId: ParaId;
	amount: BalanceOf;
}

/**
 * Bid and its corresponding set of leases.
 */
export interface IWinningDataWithLeaseSet {
	bid: IOption<IWinningData>;
	leaseSet: number[];
}

export interface IAuctionsCurrent {
	at: IAt;
	/**
	 * Fist block of the auction ending phase.
	 */
	beginEnd: IOption<AbstractInt>;
	/**
	 * Last block of the auction ending phase.
	 */
	finishEnd: IOption<BN>;
	/**
	 * Phase of auction. One of `opening` or `ending`. The `ending` phase is where
	 * an eventual winner is chosen retroactively by randomly choosing a block number
	 * in the `Ending` phase and using the `winning` bids.
	 */
	phase: IOption<AuctionPhase>;
	/**
	 * Auction number. If there is no current auction this will be the number of
	 * the previous auction.
	 */
	auctionIndex: AbstractInt;
	/**
	 * Lease period indexes that may be bid on in this auction.
	 */
	leasePeriods: IOption<number[]>;
	/**
	 * Winning bids at this current block height. Is `null` if there is no current
	 * auction OR there are no bids for the current auction.
	 */
	winning: IOption<IWinningDataWithLeaseSet[]>;
}

export interface ILeasesCurrent {
	at: IAt;
	/**
	 * The current lease period. The `leasePeriodIndex` can be null when the current block now,
	 * substracted by the offset is less than zero.
	 */
	leasePeriodIndex: BN | null;
	/**
	 * Last block of the current lease period. The `endOfLeasePeriod` may be null
	 * when the `leasePeriodIndex` is null.
	 */
	endOfLeasePeriod: BN | null;
	/**
	 * ParaIds of current lease holders.
	 */
	currentLeaseHolders?: ParaId[];
}

export interface IPara {
	/**
	 * Id of a parachain or parathread
	 */
	paraId: ParaId;
	/**
	 * Lifecycle stage of the para.
	 */
	paraLifecycle: ParaLifecycle;
	/**
	 * If the para is in the `onboarding` lifecycle stage, this will indicate if
	 * the para is onboarding as a parachain or a parathread.
	 */
	onboardingAs?: ParaType;
}

export interface IParas {
	at: IAt;
	/**
	 * All registered paras.
	 */
	paras: IPara[];
}

export interface IParasHeaders {
	[x: string]: IParasHeaderData | IAt;
}

export interface IParasHeaderData {
	/**
	 * ParaHead of the parachain.
	 */
	hash: H256;
	/**
	 * Parent hash of the current block in the parachain.
	 */
	parentHash: Hash;
	/**
	 * The current block number.
	 */
	number: Compact<BlockNumber>;
	/**
	 * The state root after executing this block.
	 */
	stateRoot: Hash;
	/**
	 * The Merkle root of the extrinsics.
	 */
	extrinsicsRoot: Hash;
	/**
	 * `DigestItem`s associated with the block.
	 */
	digest: Digest;
}
