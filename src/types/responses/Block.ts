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

import { Compact } from '@polkadot/types';
import { BlockHash, BlockNumber, Hash } from '@polkadot/types/interfaces';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import { Codec } from '@polkadot/types/types';

import { IExtrinsic, ISanitizedEvent } from '.';
import { IMessages } from './BlockXCMMessages';

export interface IBlock {
	number: Compact<BlockNumber>;
	hash: BlockHash;
	parentHash: Hash;
	stateRoot: Hash;
	extrinsicsRoot: Hash;
	authorId: AccountId | undefined;
	logs: ILog[];
	onInitialize: IOnInitializeOrFinalize;
	extrinsics: IExtrinsic[];
	onFinalize: IOnInitializeOrFinalize;
	finalized: boolean | undefined;
	decodedXcmMsgs?: IMessages | undefined;
}

interface IOnInitializeOrFinalize {
	events: ISanitizedEvent[];
}

export interface ILog {
	type: string;
	index: number;
	value: Codec;
}
