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

import accountBalance10000 from './10000.json';
import accountBalance1355087 from './1355087.json';
import accountBalance1455087 from './1455087.json';
import accountBalance1655087 from './1655087.json';
import accountBalance8990000 from './8990000.json';
import accountBalance9625229 from './9625229.json';
import accountBalance10819301 from './10819301.json';
import accountBalance11000000 from './11000000.json';
import accountBalance11100000 from './11100000.json';
import accountBalance11500000 from './11500000.json';
import accountBalance11800000 from './11800000.json';

/**
 * When it comes to kusama there are 3 major storage formats we are testing.
 *
 * Runtimes < 1050
 * Runtimes >= 1050 < 1055
 * Runtimes >= 1055
 */
export const kusamaAccountBalanceEndpoints = [
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=10000',
		JSON.stringify(accountBalance10000),
	], // v1020
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=1355087',
		JSON.stringify(accountBalance1355087),
	], // v1045
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=1455087',
		JSON.stringify(accountBalance1455087),
	], // v1051
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=1655087',
		JSON.stringify(accountBalance1655087),
	], // v1055
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=8990000',
		JSON.stringify(accountBalance8990000),
	], // v9090
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=9625229',
		JSON.stringify(accountBalance9625229),
	], // v9110
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=10819301',
		JSON.stringify(accountBalance10819301),
	], // v9130
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=11000000',
		JSON.stringify(accountBalance11000000),
	], // v9150
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=11100000',
		JSON.stringify(accountBalance11100000),
	], // v9151
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=11500000',
		JSON.stringify(accountBalance11500000),
	], // v9160
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=11800000',
		JSON.stringify(accountBalance11800000),
	], // v9170
];
