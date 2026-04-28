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
		path: '/benchmarks/accounts_validate',
	},
	'/accounts/{accountId}/convert': {
		path: '/benchmarks/accounts_convert',
	},
	'/blocks/{blockId}': {
		path: '/benchmarks/blocks_blockid',
	},
	'/blocks/{blockId}/header': {
		path: '/benchmarks/blocks_header',
	},
	'/blocks/{blockId}/extrinsics/{extrinsicIndex}': {
		path: '/benchmarks/blocks_extrinsics',
	},
	'/blocks/head': {
		path: '/benchmarks/blocks_head',
	},
	'/blocks/head/header': {
		path: '/benchmarks/blocks_head_header',
	},
	'/pallets/staking/progress': {
		path: '/benchmarks/pallets_staking_progress',
	},
	'/pallets/{palletId}/storage': {
		path: '/benchmarks/pallets_storage',
	},
	'/pallets/{palletId}/storage/{storageItemId}': {
		path: '/benchmarks/pallets_storage_item',
	},
	'/pallets/{palletId}/errors': {
		path: '/benchmarks/pallets_errors',
	},
	'/pallets/{palletId}/errors/{errorItemId}': {
		path: '/benchmarks/pallets_errors_item',
	},
	'/pallets/nomination-pools/info': {
		path: '/benchmarks/pallets_nomination_pools_info',
	},
	'/pallets/nomination-pools/{poolId}': {
		path: '/benchmarks/pallets_nomination_pools_poolid',
	},
	'/pallets/staking/validators': {
		path: '/benchmarks/pallets_staking_validators',
	},
	'/paras': {
		path: '/benchmarks/paras_list',
	},
	'/paras/leases/current': {
		path: '/benchmarks/paras_leases_current',
	},
	'/paras/auctions/current': {
		path: '/benchmarks/paras_auctions_current',
	},
	'/paras/crowdloans': {
		path: '/benchmarks/paras_crowdloans',
	},
	'/paras/{paraId}/crowdloan-info': {
		path: '/benchmarks/paras_crowdloan_info',
	},
	'/paras/{paraId}/lease-info': {
		path: '/benchmarks/paras_lease_info',
	},
	'/node/network': {
		path: '/benchmarks/node_network',
	},
	'/node/transaction-pool': {
		path: '/benchmarks/node_transaction_pool',
	},
	'/node/version': {
		path: '/benchmarks/node_version',
	},
	'/runtime/spec': {
		path: '/benchmarks/runtime',
	},
	'/transaction/material': {
		path: '/benchmarks/transaction_material',
	},
};
