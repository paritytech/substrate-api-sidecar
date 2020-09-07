import { IFrameMethod, ISanitizedArgs } from '.';

export interface ISanitizedCall {
	[key: string]: unknown;
	method: string | IFrameMethod;
	callIndex?: Uint8Array | string;
	args: ISanitizedArgs;
}
