import { DecoratedMeta } from '@polkadot/metadata/decorate/types';
import { Compact } from '@polkadot/types';
import { BlockHash, BlockNumber, Hash } from '@polkadot/types/interfaces';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import { Codec } from '@polkadot/types/types';
import { CalcFee } from '@substrate/calc';

import { IExtrinsic, ISanitizedEvent } from '.';

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
}

interface IOnInitializeOrFinalize {
	events: ISanitizedEvent[];
}

interface ILog {
	type: string;
	index: number;
	value: Codec;
}

export interface ICalcFee {
	calcFee?: null | CalcFee;
	specName: string | number;
	specVersion: string | number;
	decorated?: DecoratedMeta;
	runtimeDoesNotMatch?: boolean;
}
