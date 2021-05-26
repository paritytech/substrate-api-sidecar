/**
 * Block Responses
 */
export interface BlockResponse {
	number: string;
	hash: string;
	parentHash: string;
	stateRoot: string;
	extrinsicsRoot: string;
	authorId: string | undefined;
	logs: Array<object>;
	onInitialize: object;
	extrinsics: Array<object>;
	onFinalize: object;
	finalized: boolean | undefined;
}
