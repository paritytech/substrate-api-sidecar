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

import {
	AccountsAssets,
	AccountsBalanceInfo,
	AccountsConvert,
	AccountsStakingInfo,
	AccountsStakingPayouts,
	AccountsValidate,
	AccountsVestingInfo,
} from './accounts';
import { Blocks, BlocksExtrinsics, BlocksTrace } from './blocks';
import { ContractsInk } from './contracts';
import { NodeNetwork, NodeTransactionPool, NodeVersion } from './node';
import {
	PalletsAssets,
	PalletsConsts,
	PalletsDispatchables,
	PalletsErrors,
	PalletsEvents,
	PalletsNominationPools,
	PalletsStakingProgress,
	PalletsStakingValidators,
	PalletsStorage,
} from './pallets';
import { Paras } from './paras';
import { RuntimeCode, RuntimeMetadata, RuntimeSpec } from './runtime';
import {
	TransactionDryRun,
	TransactionFeeEstimate,
	TransactionMaterial,
	TransactionSubmit,
} from './transaction';

/**
 * Object containing every controller class definition.
 */
export const controllers = {
	Blocks,
	BlocksExtrinsics,
	BlocksTrace,
	AccountsAssets,
	AccountsBalanceInfo,
	AccountsConvert,
	AccountsStakingInfo,
	AccountsValidate,
	AccountsVestingInfo,
	AccountsStakingPayouts,
	ContractsInk,
	PalletsAssets,
	PalletsDispatchables,
	PalletsConsts,
	PalletsErrors,
	PalletsEvents,
	PalletsNominationPools,
	PalletsStakingProgress,
	PalletsStakingValidators,
	PalletsStorage,
	NodeNetwork,
	NodeTransactionPool,
	NodeVersion,
	RuntimeCode,
	RuntimeMetadata,
	RuntimeSpec,
	TransactionDryRun,
	TransactionFeeEstimate,
	TransactionMaterial,
	TransactionSubmit,
	Paras,
};
