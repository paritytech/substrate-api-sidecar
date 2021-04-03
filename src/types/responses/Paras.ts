import { Option } from '@polkadot/types/codec';
import { FundInfo, ParaId } from '@polkadot/types/interfaces';
import BN from 'bn.js';

import { IOption } from '../util';
import { IAt } from './';

export interface IEntries {
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

export interface ICrowdloansInfoResponse {
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

export interface ICrowdloansResponse {
	at: IAt;
	funds: IEntries[];
}
