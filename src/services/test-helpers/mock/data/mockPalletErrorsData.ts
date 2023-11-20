// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

import { polkadotRegistryV9300 } from '../../../../test-helpers/registries';

export const getPalletErrors = {
	democracy: {
		ValueLow: {
			meta: {
				name: 'ValueLow',
				fields: [],
				index: polkadotRegistryV9300.createType('u8', 0),
				docs: polkadotRegistryV9300.createType('Vec<Text>', ['Value too low']),
				args: [],
			},
		},
		ProposalMissing: {
			meta: {
				name: 'ProposalMissing',
				fields: [],
				index: polkadotRegistryV9300.createType('u8', 1),
				docs: polkadotRegistryV9300.createType('Vec<Text>', ['Proposal does not exist']),
				args: [],
			},
		},
		InsufficientFunds: {
			meta: {
				name: 'InsufficientFunds',
				fields: [],
				index: polkadotRegistryV9300.createType('u8', 26),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [
					'Too high a balance was provided that the account cannot afford.',
				]),
				args: [],
			},
		},
	},
};
