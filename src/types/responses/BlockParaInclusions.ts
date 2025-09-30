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

import { IAt } from '.';

/**
 * Response type for /blocks/{blockId}/para-inclusions endpoint
 * Contains all decoded parachain inclusion information for a relay chain block
 */
export interface IBlockParaInclusions {
	/**
	 * Block height and hash at which the query was made
	 */
	at: IAt;
	/**
	 * Array of parachain inclusions in this relay chain block
	 */
	inclusions: IParaInclusion[];
}

/**
 * Information about a single parachain inclusion event
 */
export interface IParaInclusion {
	/**
	 * The parachain ID
	 */
	paraId: string;
	/**
	 * The parachain block number that was included (decoded from HeadData)
	 */
	paraBlockNumber: number;
	/**
	 * The parachain block hash that was included (decoded from HeadData)
	 */
	paraBlockHash: string;
	/**
	 * Candidate descriptor containing parachain inclusion metadata
	 */
	descriptor: IParaInclusionDescriptor;
	/**
	 * Hash of the candidate commitments
	 */
	commitmentsHash: string;
	/**
	 * Core index (available in data[2])
	 */
	coreIndex: string;
	/**
	 * Group index (available in data[3])
	 */
	groupIndex: string;
}

/**
 * Candidate descriptor from the parachain inclusion event
 */
export interface IParaInclusionDescriptor {
	/**
	 * The relay chain parent block hash
	 */
	relayParent: string;
	/**
	 * Hash of the persisted validation data
	 */
	persistedValidationDataHash: string;
	/**
	 * Hash of the Proof of Validity (PoV)
	 */
	povHash: string;
	/**
	 * Root hash of the erasure encoding
	 */
	erasureRoot: string;
	/**
	 * Hash of the parachain head data
	 */
	paraHead: string;
	/**
	 * Hash of the validation code
	 */
	validationCodeHash: string;
}
