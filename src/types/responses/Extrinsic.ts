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

import {
	Address,
	EcdsaSignature,
	Ed25519Signature,
	RuntimeDispatchInfo,
	Sr25519Signature,
} from '@polkadot/types/interfaces';
import { ICompact, INumber } from '@polkadot/types-codec/types/interfaces';

import { IAt, IFrameMethod, ISanitizedArgs, ISanitizedEvent } from '.';

export interface IExtrinsic {
	method: string | IFrameMethod;
	signature: ISignature | null;
	nonce: ICompact<INumber> | null;
	args: ISanitizedArgs;
	tip: ICompact<INumber> | null;
	hash: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	info: RuntimeDispatchInfo | { error: string } | {};
	events: ISanitizedEvent[];
	success: string | boolean;
	paysFee: boolean | null;
}

export interface ISignature {
	signature: EcdsaSignature | Ed25519Signature | Sr25519Signature;
	signer: Address;
}

export interface IExtrinsicIndex {
	at: IAt;
	extrinsics: IExtrinsic;
}
