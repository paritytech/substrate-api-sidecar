// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import type { u128, Vec } from '@polkadot/types';
import type { Compact, Option } from '@polkadot/types/codec';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type {
	PalletStakingNominations,
	PalletStakingRewardDestination,
	PalletStakingUnlockChunk,
} from '@polkadot/types/lookup';

import { IAt } from '.';

export type ValidatorStatus = 'claimed' | 'unclaimed' | 'partially claimed' | 'undefined';
export type NominatorStatus = 'claimed' | 'unclaimed' | 'undefined';

export interface IEraStatus<T> {
	era: number;
	status: T;
}

export interface IStakingLedger {
	stash: AccountId;
	total: Compact<u128>;
	active: Compact<u128>;
	unlocking: Vec<PalletStakingUnlockChunk>;
	claimedRewards?: IEraStatus<ValidatorStatus | NominatorStatus>[];
}

export interface IAccountStakingInfo {
	at: IAt;
	controller: AccountId;
	rewardDestination: Option<PalletStakingRewardDestination>;
	numSlashingSpans: number;
	nominations: PalletStakingNominations | null;
	staking: IStakingLedger | null;
	rcBlockNumber?: string;
	ahTimestamp?: string;
}
