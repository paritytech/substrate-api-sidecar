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

import { AnyJson } from '@polkadot/types/types';

import { IAt } from './At';

export interface IPalletStakingProgress {
	at: IAt;
	idealValidatorCount?: string | null;
	activeEra: string | null;
	forceEra: AnyJson;
	nextActiveEraEstimate?: AnyJson;
	nextSessionEstimate: string | null;
	unappliedSlashes: AnyJson[] | null;
	electionStatus?:
		| {
				status: AnyJson;
				toggleEstimate: string | null;
		  }
		| string;
	validatorSet?: string[] | null;
	rcBlockNumber?: string;
	ahTimestamp?: string;
}
