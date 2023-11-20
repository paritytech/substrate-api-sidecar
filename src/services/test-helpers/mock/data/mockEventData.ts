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

import { Codec, IEventData } from '@polkadot/types/types';

import { polkadotRegistry } from '../../../../test-helpers/registries';
import { ISanitizedEvent } from '../../../../types/responses';

/**
 * Construct a Vec type. We are only concerned with the Balances here, therefore in order to not
 * have to construct a `Codec[] & IEventData` type which takes a large amount of boilerplate
 * we use this shortcut by creating a `Vec<Balance>` type which represents exactly what we need
 * to construct the `data` for an `ISanitizedEvent`.
 */
const constructCodecData = (data: string[]) => {
	return polkadotRegistry.createType(
		'Vec<Balance>',
		data.map((val) =>
			val.startsWith('0x')
				? polkadotRegistry.createType('AccountId', val)
				: polkadotRegistry.createType('Balance', val),
		),
	);
};

/**
 *  Construct events for testing.
 */
export const constructEvent = (pallet: string, method: string, data: string[]): ISanitizedEvent => {
	return {
		method: {
			pallet,
			method,
		},
		data: constructCodecData(data) as unknown as Codec[] & IEventData,
	};
};

export const withdrawEvent = [constructEvent('balances', 'Withdraw', ['0x', '2490128143'])];

export const withdrawEventForTip = [constructEvent('balances', 'Withdraw', ['0x', '1681144907847007'])];

export const treasuryEvent = [
	// Set the fee inside of the data for withdraw 1 decimal larger than expected.
	constructEvent('balances', 'Withdraw', ['0x', '24901281430']),
	constructEvent('treasury', 'Deposit', ['2490128143']),
];

export const balancesDepositEvent = [
	constructEvent('balances', 'Withdraw', ['0x', '24901281430']),
	constructEvent('treasury', 'Deposit', ['24901281430']),
	constructEvent('balances', 'Deposit', ['0x', '1245064072']),
	constructEvent('balances', 'Deposit', ['0x', '1245064071']),
];
