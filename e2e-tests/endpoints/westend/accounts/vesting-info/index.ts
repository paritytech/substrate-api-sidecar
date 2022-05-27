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

import accountVestingInfo4802950 from './4802950.json';
import accountVestingInfo6052407 from './6052407.json';

export const westendAccountVestingInfoEndpoints = [
	[
		'/accounts/5H6b7Xsinpxag8DXE6gPv1UEaTrmWNkaKwsiTg7kad7JBTSe/vesting-info?at=4802950',
		JSON.stringify(accountVestingInfo4802950),
	],
	[
		'/accounts/5Dw5KnvTs96FaRQFez1Su15XMMJ65QAi4F1ugNBaXUBiGbX6/vesting-info?at=6052407',
		JSON.stringify(accountVestingInfo6052407),
	],
];
