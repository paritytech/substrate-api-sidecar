// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
 * Runtime type
 */
export type RuntimeResponse = IRuntimeSpec | IRuntimeCode | IRuntimeMetadata;

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
 * Response for `/accounts/vesting-info`
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

/**
 * Response for `/runtime/spec`
 */
export interface IRuntimeSpec {
	at: IAt;
	authoringVersion: string;
	chainType: string;
	implVersion: string;
	specName: string;
	specVersion: string;
	transactionVersion: string;
	properties: object;
}

/**
 * Response for `/runtime/code`
 */
export interface IRuntimeCode {
	at: IAt;
	code: string;
}

/**
 * Response for `/runtime/code`
 */
export type IRuntimeMetadata = Object;
