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

export const getPalletEvents = {
	democracy: {
		Proposed: {
			meta: {
				name: 'Proposed',
				fields: polkadotRegistryV9300.createType('Vec<Si1Field>', [
					{
						name: null,
						type: '127',
						typeName: null,
						docs: [],
					},
					{
						name: null,
						type: '41',
						typeName: null,
						docs: [],
					},
				]),
				index: polkadotRegistryV9300.createType('u8', 0),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [' A motion has been proposed by a public account.']),
				args: polkadotRegistryV9300.createType('Vec<Text>', ['PropIndex', 'Balance']),
			},
		},
		Tabled: {
			meta: {
				name: 'Tabled',
				fields: polkadotRegistryV9300.createType('Vec<Si1Field>', [
					{
						name: null,
						type: '127',
						typeName: null,
						docs: [],
					},
					{
						name: null,
						type: '41',
						typeName: null,
						docs: [],
					},
					{
						name: null,
						type: '37',
						typeName: null,
						docs: [],
					},
				]),
				index: polkadotRegistryV9300.createType('u8', 1),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [
					' A public proposal has been tabled for referendum vote.',
				]),
				args: polkadotRegistryV9300.createType('Vec<Type>', ['PropIndex', 'Balance', 'Vec<AccountId>']),
			},
		},
		ExternalTabled: {
			meta: {
				name: 'ExternalTabled',
				fields: polkadotRegistryV9300.createType('Vec<Si1Field>', []),
				index: polkadotRegistryV9300.createType('u8', 2),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [' An external proposal has been tabled.']),
				args: polkadotRegistryV9300.createType('Vec<Text>', []),
			},
		},
	},
};
