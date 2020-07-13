import { Compact, Vec } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import Address from '@polkadot/types/generic/Address';
import { EventData } from '@polkadot/types/generic/Event';
import {
	AccountId,
	Balance,
	BalanceLock,
	BlockHash,
	BlockNumber,
	EcdsaSignature,
	Ed25519Signature,
	Hash,
	Index,
	RewardDestination,
	RuntimeDispatchInfo,
	Sr25519Signature,
	StakingLedger,
	VestingInfo,
} from '@polkadot/types/interfaces';
import U32 from '@polkadot/types/primitive/U32';

import { AnyJson, Codec } from '../types/polkadot-js';

interface IAt {
	hash: string | BlockHash;
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

export interface IAccountBalanceSummary {
	at: IAt;
	nonce: Index;
	free: Balance;
	reserved: Balance;
	miscFrozen: Balance;
	feeFrozen: Balance;
	locks: Vec<BalanceLock>;
}

export interface IAccountStakingSummary {
	at: IAt;
	controller: AccountId;
	rewardDestination: RewardDestination;
	numSlashingSpans: number;
	staking: StakingLedger;
}

export interface IAccountVestingSummary {
	at: IAt;
	// eslint-disable-next-line @typescript-eslint/ban-types
	vesting: Option<VestingInfo> | {};
}

export interface ITxConstructionMaterial {
	at: IAt;
	genesisHash: BlockHash;
	chainName: string;
	specName: string;
	specVersion: U32;
	txVersion: U32;
	metadata: string;
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
	tip: Compact<Balance>;
	hash: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	info: RuntimeDispatchInfo | { error: string } | {};
	events: ISanitizedEvent[];
	success: string | boolean;
	paysFee: boolean | null;
}
