import { Option } from '@polkadot/types/codec';
import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import {
	AccountId,
	BalanceOf,
	FundInfo,
	ParaId,
	ParaLifecycle,
	WinningData,
} from '@polkadot/types/interfaces';
import BN from 'bn.js';

import { IOption } from '../util';
import { IAt } from './';

export type AuctionPhase = 'preEnding' | 'ending';

export type ParaType = 'parachain' | 'parathread';

export interface IFund {
	/**
	 * Id of the para that has a crowloan.
	 */
	paraId: ParaId;
	/**
	 * `FundInfo` for the para's crowdloan. Use query param `fundInfo=true` to include the `FundInfo`.
	 * Inclusion may make query take longer.
	 */
	fundInfo?: Option<FundInfo>;
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
	/**
	 * End of the the funds retirement period. After this the funds are lost.
	 */
	retirementEnd?: BN;
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
	 * Lease period. (Represents a ~6 month period that a parachain holds a lease for.)
	 */
	leasePeriodIndex: number;
	/**
	 * Amount held on deposit for parachain
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
	 * Lifecycle of the para (i.e Onboarding, Parathread, Offboarding etc)
	 */
	paraLifeCycle: ParaLifecycle;
	/**
	 * If the para is in the onboarding phase, this will say if it is onboarding as
	 * a `parachain` or a `parathread`.
	 */
	onboardingAs?: ParaType;
	/**
	 * List of current and upcoming leases this para has.
	 */
	leases: IOption<LeaseFormatted[]>;
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
	 * Phase of auction. One of `PreEnding` or `Ending`. The `Ending` phase is where
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
	 * Lease period indexs that may be bid on in this auction.
	 */
	leasePeriods: IOption<number[]>;
	/**
	 * Winning bids at this current block height. Is only not `null` during the
	 * `Ending` phase.
	 */
	winning: IOption<Option<WinningData>>;
}

export interface ILeasesCurrent {
	at: IAt;
	/**
	 * The current lease period.
	 */
	leasePeriodIndex: BN;
	/**
	 * Last block of the current lease period.
	 */
	endOfLeasePeriod: BN;
	/**
	 * ParaIds of current lease holders.
	 */
	currentLeaseHolders?: ParaId[];
}

export interface IPara {
	/**
	 * ParaId
	 */
	paraId: ParaId;
	/**
	 * Lifecycle stage of the para.
	 */
	paraLifeCycle: ParaLifecycle;
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
