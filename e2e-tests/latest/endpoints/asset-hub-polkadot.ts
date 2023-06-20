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

export const assetHubPolkadot: IConfig = {
	'/accounts/{accountId}/asset-balances': {
		path: '/accounts/1ULZhwpUPLLg5VRYiq6rBHY8XaShAmBW7kqGBfvHBqrgBcN/asset-balances',
		queryParams: ['at={blockId}', 'assets[]=100&assets[]=123'],
	},
	'/accounts/{accountId}/asset-approvals': {
		path: '/accounts/13zCwRqhAj4D33czsm1G82EgHBNq58CCcWRsbwABaby64p1A/asset-approvals?at={blockId}&assetId=1984&delegate=12jU3Wn96uJgfiAe7Zk9s1vKWDz8SBNnqQ8t7s8kj1hDxMMc',
		queryParams: [],
	},
	'/pallets/assets/{assetId}/asset-info': {
		path: '/pallets/assets/123/asset-info',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/consts': {
		path: '/pallets/assets/consts',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/consts/{constantItemId}': {
		path: '/pallets/assets/consts/AssetDeposit',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/dispatchables': {
		path: '/pallets/assets/dispatchables',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/dispatchables/{dispatchableItemId}': {
		path: '/pallets/assets/dispatchables/create',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/errors': {
		path: '/pallets/assets/errors',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/errors/{errorItemId}': {
		path: '/pallets/assets/errors/Frozen',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/events': {
		path: '/pallets/assets/events',
		queryParams: ['at={blockId}'],
	},
	'/pallets/{palletId}/events/{eventItemId}': {
		path: '/pallets/assets/events/Created',
		queryParams: ['at={blockId}'],
	},
};
