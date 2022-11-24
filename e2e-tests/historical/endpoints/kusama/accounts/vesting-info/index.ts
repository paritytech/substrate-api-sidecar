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

import accountVestingInfo3132897 from './3132897.json';
import accountVestingInfo5190210 from './5190210.json';
import accountVestingInfo5626862 from './5626862.json';
import accountVestingInfo7523076 from './7523076.json';
import accountVestingInfo9123076 from './9123076.json';
import accountVestingInfo9625129 from './9625129.json';
import accountVestingInfo10819301 from './10819301.json';
import accountVestingInfo11000000 from './11000000.json';
import accountVestingInfo11100000 from './11100000.json';
import accountVestingInfo11500000 from './11500000.json';
import accountVestingInfo11800000 from './11800000.json';

export const kusamaAccountVestingInfoEndpoints = [
	[
		'/accounts/Dz8AripX8Jbpi78u5jjnGZxAQtfC149XBJ5UMEXYPX5EwF2/vesting-info?at=3132897',
		JSON.stringify(accountVestingInfo3132897),
	], // v2012
	[
		'/accounts/DWUAQt9zcpnQt5dT48NwWbJuxQ78vKRK9PRkHDkGDn9TJ1j/vesting-info?at=5190210',
		JSON.stringify(accountVestingInfo5190210),
	], // v2026
	[
		'/accounts/DWUAQt9zcpnQt5dT48NwWbJuxQ78vKRK9PRkHDkGDn9TJ1j/vesting-info?at=5626862',
		JSON.stringify(accountVestingInfo5626862),
	], // v2026
	[
		'/accounts/D3icRvk43Bj69ChTPkx5v4pEQKGqDY95hHXiBB1JBFVwtvP/vesting-info?at=7523076',
		JSON.stringify(accountVestingInfo7523076),
	], // v9010
	[
		'/accounts/D3icRvk43Bj69ChTPkx5v4pEQKGqDY95hHXiBB1JBFVwtvP/vesting-info?at=9123076',
		JSON.stringify(accountVestingInfo9123076),
	], // v9090
	[
		'/accounts/D3icRvk43Bj69ChTPkx5v4pEQKGqDY95hHXiBB1JBFVwtvP/vesting-info?at=9625129',
		JSON.stringify(accountVestingInfo9625129),
	], // v9111
	[
		'/accounts/D3icRvk43Bj69ChTPkx5v4pEQKGqDY95hHXiBB1JBFVwtvP/vesting-info?at=10819301',
		JSON.stringify(accountVestingInfo10819301),
	], // v9130
	[
		'/accounts/D3icRvk43Bj69ChTPkx5v4pEQKGqDY95hHXiBB1JBFVwtvP/vesting-info?at=11000000',
		JSON.stringify(accountVestingInfo11000000),
	], // v9150
	[
		'/accounts/D3icRvk43Bj69ChTPkx5v4pEQKGqDY95hHXiBB1JBFVwtvP/vesting-info?at=11100000',
		JSON.stringify(accountVestingInfo11100000),
	], // v9151
	[
		'/accounts/D3icRvk43Bj69ChTPkx5v4pEQKGqDY95hHXiBB1JBFVwtvP/vesting-info?at=11500000',
		JSON.stringify(accountVestingInfo11500000),
	], // v9160
	[
		'/accounts/D3icRvk43Bj69ChTPkx5v4pEQKGqDY95hHXiBB1JBFVwtvP/vesting-info?at=11800000',
		JSON.stringify(accountVestingInfo11800000),
	], // v9170
];
