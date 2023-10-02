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

import { ControllerConfig } from '../types/chains-config';
import { initLRUCache, QueryFeeDetailsCache } from './cache';

/**
 * Controllers for Shiden collator
 */
export const shidenControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
		'AccountsVestingInfo',
		'AccountsValidate',
		'Blocks',
		'BlocksExtrinsics',
		'BlocksTrace',
		'BlocksRawExtrinsics',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
		'PalletsAssets',
		'PalletsStorage',
		'Paras',
		'RuntimeCode',
		'RuntimeMetadata',
		'RuntimeSpec',
		'TransactionFeeEstimate',
		'TransactionMaterial',
		'TransactionSubmit',
	],
	options: {
		finalizes: true,
		minCalcFeeRuntime: 1,
		blockStore: initLRUCache(),
		hasQueryFeeApi: new QueryFeeDetailsCache(null, null),
	},
};
