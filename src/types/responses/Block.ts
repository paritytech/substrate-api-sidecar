import { Compact } from '@polkadot/types';
import AccountId from '@polkadot/types/generic/AccountId';
import Address from '@polkadot/types/generic/Address';
import {
	Balance,
	BlockHash,
	BlockNumber,
	EcdsaSignature,
	Ed25519Signature,
	Hash,
	Index,
	RuntimeDispatchInfo,
	Sr25519Signature,
} from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';

import { ISanitizedArgs, ISanitizedEvent } from '.';

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
}

interface IExtrinsic {
	method: string;
	signature: ISignature | null;
	nonce: Compact<Index>;
	args: Codec[];
	newArgs: ISanitizedArgs;
	tip: Compact<Balance>;
	hash: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	info: RuntimeDispatchInfo | { error: string } | {};
	events: ISanitizedEvent[];
	success: string | boolean;
	paysFee: boolean | null;
}

interface IOnInitializeOrFinalize {
	events: ISanitizedEvent[];
}

interface ISignature {
	signature: EcdsaSignature | Ed25519Signature | Sr25519Signature;
	signer: Address;
}

interface ILog {
	type: string;
	index: number;
	value: Codec;
}
