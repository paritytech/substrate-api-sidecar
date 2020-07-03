import { Compact } from '@polkadot/types';
import Address from '@polkadot/types/generic/Address';
import { EventData } from '@polkadot/types/generic/Event';
import {
	AccountId,
	BlockHash,
	BlockNumber,
	EcdsaSignature,
	Ed25519Signature,
	Hash,
	Index,
	Sr25519Signature,
} from '@polkadot/types/interfaces';
import { AnyJson, Codec } from '@polkadot/types/types';

interface IAt {
	hash: string;
	height: string;
}

export interface IStakingInfo {
	at: IAt;
	idealValidatorCount?: string | null;
	activeEra: string | null;
	forceEra: AnyJson;
	nextActiveEraEstimate?: AnyJson;
	nextSessionEstimate: string | null;
	unappliedSlashes: AnyJson[] | null;
	electionStatus?: {
		status: AnyJson;
		toggleEstimate: string | null;
	};
	validatorSet?: string[] | null;
}

export interface ISanitizedEvent {
	method: string;
	data: EventData;
}

export interface ISanitizedCall {
	[key: string]: unknown;
	method: string;
	callIndex: Uint8Array | string;
	args: ISanitizedArgs;
}

export interface IBlockResponse {
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

interface ILog {
	type: string;
	index: number;
	value: Codec;
}

interface IOnInitializeOrFinalize {
	events: ISanitizedEvent[];
}

interface ISignature {
	signature: EcdsaSignature | Ed25519Signature | Sr25519Signature;
	signer: Address;
}

interface ISanitizedArgs {
	call?: ISanitizedCall;
	calls?: ISanitizedCall[];
	[key: string]: unknown;
}

interface IExtrinsic {
	method: string;
	signature: ISignature | null;
	nonce: Compact<Index>;
	args: Codec[];
	newArgs: ISanitizedArgs;
}
