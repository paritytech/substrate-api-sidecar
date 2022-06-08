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

import { Balance } from '@polkadot/types/interfaces';

interface IPoolExtrinsic {
	/**
	 * H256 hash of the extrinsic
	 */
	hash: string;
	/**
	 * SCALE encoded extrinsic
	 */
	encodedExtrinsic: string;
	/**
	 * The tip within an extrinsic. Available when the `tip` query parameter
	 * for `/node/transaction-pool` is set to true.
	 */
	tip?: string;
	/**
	 * PartialFee for a transaction
	 */
	partialFee?: Balance;
	/**
	 * Priority of the transaction. Calculated by tip * (max_block_{weight|length} / bounded_{weight|length})
	 */
	priority?: string;
}

export interface INodeTransactionPool {
	pool: IPoolExtrinsic[];
}
