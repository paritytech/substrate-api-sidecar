import { ISanitizedArgs } from '.';

export interface ISanitizedCall {
	[key: string]: unknown;
	method: string;
	callIndex: Uint8Array | string;
	args: ISanitizedArgs;
}
