// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import type { LRUCache } from 'lru-cache';

import { QueryFeeDetailsCache } from '../../chains-config/cache';
import { controllers } from '../../controllers';
import { IBlock } from '../../types/responses';
import { IOption } from '../util';

/**
 * Controller mounting configuration as an object where the keys are the
 * controller class names and the values are booleans indicating whether or not
 * to include the controller.
 *
 * There is an additional `finalizes` field that is used to indicate wether or
 * not a chain has finalized blocks. Practically, this only affects if
 * `BlocksController` defaults to getFinalizedHead (in the case it finalizes) or
 *  getHeader (in the case it does not finalize)
 */
export interface ControllerConfig {
	/**
	 * Controller class names to be included
	 */
	controllers: (keyof typeof controllers)[];
	/**
	 * Options relating to how the controllers are configured.
	 */
	options: ControllerOptions;
}

export interface ControllerOptions {
	/**
	 * Whether or not the chain finalizes blocks
	 */
	finalizes?: boolean;
	/**
	 * The minimum runtime that supports fee's.
	 */
	minCalcFeeRuntime: IOption<number>;
	/**
	 * LRU cache that stores the 2 most recent queries.
	 */
	blockStore: LRUCache<string, IBlock>;
	/**
	 * Cache for storing runtime versions that either have queryFeeDetails, or dont.
	 */
	hasQueryFeeApi: QueryFeeDetailsCache;
}
