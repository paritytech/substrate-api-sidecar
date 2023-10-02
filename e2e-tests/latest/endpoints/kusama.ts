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

import { IConfig } from '../types/endpoints';

export const kusama: IConfig = {
	'/pallets/staking/validators': {
		path: '/pallets/staking/validators',
		queryParams: ['at={blockId}', 'metadata=true'],
	},
	'/blocks': {
		path: '/blocks?range=1-5',
		queryParams: [],
	},
	'/blocks/{blockId}': {
		path: '/blocks/{blockId}',
		queryParams: ['eventDocs=true', 'extrinsicDocs=true'],
	},
	'/blocks/{blockId}/header': {
		path: '/blocks/{blockId}/header',
		queryParams: [],
	},
	'/blocks/{blockId}/extrinsics/{extrinsicIndex}': {
		path: `/blocks/{blockId}/extrinsics/0`,
		queryParams: ['eventDocs=true', 'extrinsicDocs=true'],
	},
	'/blocks/head': {
		path: `/blocks/head`,
		queryParams: ['eventDocs=true', 'extrinsicDocs=true'],
	},
	'/blocks/head/header': {
		path: '/blocks/head',
		queryParams: [],
	},
	'/blocks/{blockId}/extrinsics-raw': {
		path: `/blocks/{blockId}/extrinsics-raw`,
		queryParams: [],
	},
	'/node/network': {
		path: '/node/network',
		queryParams: [],
	},
	'/node/transaction-pool': {
		path: '/node/transaction-pool',
		queryParams: ['includeFee=true'],
	},
	'/node/version': {
		path: '/node/version',
		queryParams: [],
	},
	'/pallets/staking/progress': {
		path: '/pallets/staking/progress',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/storage': {
		path: '/pallets/System/storage',
		queryParams: ['onlyIds=true', 'at={blockId}'],
	},
	'/pallets/{palletId}/storage/{storageItemId}': {
		path: '/pallets/System/storage/BlockWeight',
		queryParams: ['metadata=true', 'at={blockId}'],
	},
	'/runtime/metadata': {
		path: '/runtime/metadata',
		queryParams: ['at={blockId}'],
	},
	'/runtime/code': {
		path: '/runtime/code',
		queryParams: ['at={blockId}'],
	},
	'/runtime/spec': {
		path: '/runtime/spec',
		queryParams: ['at={blockId}'],
	},
	'/transaction/material': {
		path: '/transaction/material',
		queryParams: [],
	},
	'/paras': {
		path: '/paras',
		queryParams: ['at={blockId}'],
	},
	'/paras/leases/current': {
		path: '/paras/leases/current',
		queryParams: ['at={blockId}', 'currentLeaseHolders=false'],
	},
	'/paras/auctions/current': {
		path: '/paras/auctions/current',
		queryParams: ['at={blockId}'],
	},
	'/paras/crowdloans': {
		path: '/paras/crowdloans',
		queryParams: ['at={blockId}'],
	},
	'/paras/{paraId}/crowdloan-info': {
		path: '/paras/2021/crowdloan-info',
		queryParams: ['at={blockId}'],
	},
	'/paras/{paraId}/lease-info': {
		path: '/paras/2021/lease-info',
		queryParams: ['at={blockId}'],
	},
	'/paras/head/included-candidates': {
		path: '/paras/head/included-candidates',
		queryParams: ['at={blockId}'],
	},
	'/paras/head/backed-candidates': {
		path: '/paras/head/backed-candidates',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/errors': {
		path: '/pallets/balances/errors',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/errors/{errorItemId}': {
		path: '/pallets/Balances/errors/VestingBalance',
		queryParams: ['at={blockId}'],
	},
	'/pallets/nominationPoools/info': {
		path: '/pallets/nomination-pools/info',
		queryParams: ['at={blockId}'],
	},
	'/pallets/nominationPoools/{poolId}': {
		path: '/pallets/nomination-pools/122',
		queryParams: ['at={blockId}', 'metadata=true'],
	},
};
