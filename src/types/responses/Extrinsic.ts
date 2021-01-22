import { Compact } from '@polkadot/types';
import {
	Address,
	Balance,
	EcdsaSignature,
	Ed25519Signature,
	Index,
	RuntimeDispatchInfo,
	Sr25519Signature,
} from '@polkadot/types/interfaces';

import { IAt, IFrameMethod, ISanitizedArgs, ISanitizedEvent } from '.';

export interface IExtrinsic {
	method: string | IFrameMethod;
	signature: ISignature | null;
	nonce: Compact<Index> | null;
	args: ISanitizedArgs;
	tip: Compact<Balance> | null;
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
