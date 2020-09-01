import { IDispatchable, ISanitizedArgs } from '.';

export interface ISanitizedCall {
	[key: string]: unknown;
	method: string | IDispatchable;
	callIndex?: Uint8Array | string;
	args: ISanitizedArgs;
}
