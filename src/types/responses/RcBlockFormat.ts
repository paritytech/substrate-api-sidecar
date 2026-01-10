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

/**
 * Minimal relay chain block header information.
 * Used when `useRcBlockFormat=object` to provide RC block context.
 */
export interface IRcBlockInfo {
	/** The relay chain block hash */
	hash: string;
	/** The parent block hash */
	parentHash: string;
	/** The relay chain block number */
	number: string;
}

/**
 * Object format response wrapper for `useRcBlockFormat=object`.
 * Provides relay chain block info alongside parachain data.
 *
 * @typeParam T - The type of data in the parachainDataPerBlock array
 */
export interface IRcBlockObjectResponse<T> {
	/** Minimal relay chain block header info */
	rcBlock: IRcBlockInfo;
	/** Array of parachain block data (empty if no AH blocks for this RC block) */
	parachainDataPerBlock: T[];
}
