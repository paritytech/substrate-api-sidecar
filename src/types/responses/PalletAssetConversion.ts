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

import { Option } from '@polkadot/types/codec';
import type {
	FrameSupportTokensFungibleUnionOfNativeOrWithId,
	PalletAssetConversionPoolInfo,
	StagingXcmV3MultiLocation,
} from '@polkadot/types/lookup';
import { Codec } from '@polkadot/types/types';
import type { ITuple } from '@polkadot/types-codec/types';

import { IAt } from '.';

export interface ILiquidityId {
	at: IAt;
	poolId: Option<Codec> | string;
}

export interface ILiquidityPoolsInfo {
	reserves: ITuple<
		[
			FrameSupportTokensFungibleUnionOfNativeOrWithId | StagingXcmV3MultiLocation,
			FrameSupportTokensFungibleUnionOfNativeOrWithId | StagingXcmV3MultiLocation,
		]
	>;
	lpToken: Option<PalletAssetConversionPoolInfo>;
}

export interface ILiquidityPools {
	at: IAt;
	pools: ILiquidityPoolsInfo[];
}
