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

import validatePolkadotHex from './validatePolkadotHex.json';
import validatePolkadotSS58 from './validatePolkadotSS58.json';

export const polkadotAccountValidateEndpoints = [
	['/accounts/1xN1Q5eKQmS5AzASdjt6R6sHF76611vKR4PFpFjy1kXau4m/validate', JSON.stringify(validatePolkadotSS58)],
	[
		'/accounts/0x002a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc592312/validate',
		JSON.stringify(validatePolkadotHex),
	],
];
