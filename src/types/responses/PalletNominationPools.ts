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

import { Option } from '@polkadot/types/codec';
import { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsRewardPool } from '@polkadot/types/lookup';
import { u32, u128 } from '@polkadot/types-codec';

import { IAt } from '.';

export interface IPalletNominationPool {
	at: IAt;
	bondedPool: Option<PalletNominationPoolsBondedPoolInner>;
	rewardPool: Option<PalletNominationPoolsRewardPool>;
	metadata?: string | null;
}

export interface IPalletNominationPoolInfo {
	at: IAt;
	counterForBondedPools: u32;
	counterForMetadata: u32;
	counterForPoolMembers: u32;
	counterForReversePoolIdLookup: u32;
	counterForRewardPools: u32;
	counterForSubPoolsStorage: u32;
	lastPoolId: u32;
	maxPoolMembers: Option<u32>;
	maxPoolMembersPerPool: Option<u32>;
	maxPools: Option<u32>;
	minCreateBond: u128;
	minJoinBond: u128;
}
