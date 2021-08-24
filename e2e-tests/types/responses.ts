/**
 * Default at for endpoints
 */
export interface IAt {
	hash: string;
	height: string;
}

/**
 * Block Responses
 */
export interface IBlockResponse {
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

/**
 * Accounts type
 */
export type AccountsResponse = IAccountBalanceInfo | IAccountVestingInfo;

/**
 * Response for `/accounts/balance-info`
 */
export interface IAccountBalanceInfo {
	at: IAt;
	nonce: string;
	tokenSymbol: string;
	free: string;
	reserved: string;
	miscFrozen: string;
	feeFrozen: string;
	locks: IBalanceLock;
}

/**
 * Balance Lock Interface
 */
export interface IBalanceLock {
	id: string;
	amount: string;
	reasons: string;
}

/**
 * Respone for `/accounts/vesting-info`
 */
export interface IAccountVestingInfo {
	at: IAt;
	vesting: IVestingSchedule;
}

/**
 * Vesting Schedule Interface
 */
export interface IVestingSchedule {
	locked: string;
	perBlock: string;
	staringBlock: string;
}
