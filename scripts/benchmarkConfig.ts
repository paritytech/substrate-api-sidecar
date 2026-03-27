// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { IBenchmarkConfig } from './types';

export const benchmarkConfig: IBenchmarkConfig = {
	'/accounts/{accountId}/balance-info': {
		path: '/benchmarks/accounts_balance_info',
	},
	'/accounts/{accountId}/vesting-info': {
		path: '/benchmarks/accounts_vesting_info',
	},
	'/accounts/{accountId}/staking-info': {
		path: '/benchmarks/accounts_staking_info',
	},
	'/accounts/{accountId}/staking-payouts': {
		path: '/benchmarks/accounts_staking_payouts',
	},
	'/accounts/{accountId}/validate': {
		path: '/benchmarks/accountsValidate',
	},
	'/accounts/{accountId}/convert': {
		path: '/benchmarks/accountsConvert',
	},
	'/blocks/{blockId}': {
		path: '/benchmarks/blocksBlockId',
	},
	'/blocks/{blockId}/header': {
		path: '/benchmarks/blocks_header',
	},
	'/blocks/{blockId}/extrinsics/{extrinsicIndex}': {
		path: '/benchmarks/blocks_extrinsics',
	},
	'/blocks/head': {
		path: '/benchmarks/blocksHead',
	},
	'/blocks/head/header': {
		path: '/benchmarks/blocksHeadHeader',
	},
	'/pallets/staking/progress': {
		path: '/benchmarks/pallets_staking_progress',
	},
	'/pallets/{palletId}/storage': {
		path: '/benchmarks/pallets_storage',
	},
	'/pallets/{palletId}/storage/{storageItemId}': {
		path: '/benchmarks/palletsPalletIdStorageStorageId',
	},
	'/pallets/{palletId}/errors': {
		path: '/benchmarks/palletsPalletIdErrors',
	},
	'/pallets/{palletId}/errors/{errorItemId}': {
		path: '/benchmarks/palletsPalletIdErrorsErrorItemId',
	},
	'/pallets/nomination-pools/info': {
		path: '/benchmarks/palletsNominationPoolsInfo',
	},
	'/pallets/nomination-pools/{poolId}': {
		path: '/benchmarks/palletsNominationPoolsPoolId',
	},
	'/pallets/staking/validators': {
		path: '/benchmarks/pallets_staking_validators',
	},
	'/paras': {
		path: '/benchmarks/paras',
	},
	'/paras/leases/current': {
		path: '/benchmarks/parasLeasesCurrent',
	},
	'/paras/auctions/current': {
		path: '/benchmarks/parasAuctionsCurrent',
	},
	'/paras/crowdloans': {
		path: '/benchmarks/parasCrowdloans',
	},
	'/paras/{paraId}/crowdloan-info': {
		path: '/benchmarks/parasParaIdCrowdloanInfo',
	},
	'/paras/{paraId}/lease-info': {
		path: '/benchmarks/parasParaIdLeasesInfo',
	},
	'/node/network': {
		path: '/benchmarks/nodeNetwork',
	},
	'/node/transaction-pool': {
		path: '/benchmarks/nodeTransactionPool',
	},
	'/node/version': {
		path: '/benchmarks/nodeVersion',
	},
	'/runtime/spec': {
		path: '/benchmarks/runtime',
	},
	'/transaction/material': {
		path: '/benchmarks/transaction_material',
	},
};
