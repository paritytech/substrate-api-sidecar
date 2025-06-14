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

import { ControllerConfig } from '../types/chains-config';
import { initLRUCache, QueryFeeDetailsCache } from './cache';

/**
 * Polymesh configuration for Sidecar.
 */
export const polymeshControllers: ControllerConfig = {
	controllers: [
		'AccountsBalanceInfo',
		'AccountsCompare',
		'AccountsConvert',
		'AccountsStakingInfo',
		'AccountsStakingPayouts',
		'AccountsValidate',
		'Blocks',
		'BlocksExtrinsics',
		'BlocksRawExtrinsics',
		'BlocksTrace',
		'NodeNetwork',
		'NodeTransactionPool',
		'NodeVersion',
		'PalletsConsts',
		'PalletsDispatchables',
		'PalletsErrors',
		'PalletsEvents',
		'PalletsStakingProgress',
		'PalletsStakingValidators',
		'PalletsStorage',
		'RuntimeCode',
		'RuntimeMetadata',
		'RuntimeSpec',
		'TransactionDryRun',
		'TransactionFeeEstimate',
		'TransactionMaterial',
		'TransactionSubmit',
	],
	options: {
		finalizes: true,
		minCalcFeeRuntime: 0,
		blockStore: initLRUCache(),
		hasQueryFeeApi: new QueryFeeDetailsCache(null, null),
	},
};
