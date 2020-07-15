import { ISanitizedCall } from '.';

export interface ISanitizedArgs {
	call?: ISanitizedCall;
	calls?: ISanitizedCall[];
	[key: string]: unknown;
}
