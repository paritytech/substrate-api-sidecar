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

import BN from 'bn.js';

import { polkadotRegistryV9122 } from '../../../../test-helpers/registries';

const value = polkadotRegistryV9122.createType(
	'Compact<u128>',
	new BN('33223051661066606')
);

export const mockDeriveValidatorExposure = {
	'12JZr1HgK8w6zsbBj6oAEVRkvisn8j3MrkXugqtvc4E8uwLo': {
		total: polkadotRegistryV9122.createType(
			'Compact<u128>',
			new BN('33223251661066606')
		),
		own: polkadotRegistryV9122.createType('Compact<u128>', 200000000000),
		others: [
			{
				who: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
				value,
			},
		],
	},
	'1HDgY7vpDjafR5NM8dbwm1b3Rrs4zATuSCHHbe7YgpKUKFw': {
		total: polkadotRegistryV9122.createType(
			'Compact<u128>',
			new BN('33223061661066606')
		),
		own: polkadotRegistryV9122.createType('Compact<u128>', 10000000000),
		others: [
			{
				who: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
				value,
			},
		],
	},
};
