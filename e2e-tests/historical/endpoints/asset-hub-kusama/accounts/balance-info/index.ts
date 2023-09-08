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

import accountBalance450000 from './450000.json';
import accountBalance650000 from './650000.json';
import accountBalance960000 from './960000.json';
import accountBalance986791 from './986791.json';
import accountBalance1100000 from './1100000.json';
import accountBalance1300000 from './1300000.json';
import accountBalance1800000 from './1800000.json';

export const assetHubKusamaAccountBalanceEndpoints = [
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/balance-info?at=450000',
		JSON.stringify(accountBalance450000),
	], // v2
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/balance-info?at=650000',
		JSON.stringify(accountBalance650000),
	], // v3
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/balance-info?at=960000',
		JSON.stringify(accountBalance960000),
	], // v4
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/balance-info?at=986791',
		JSON.stringify(accountBalance986791),
	], // v5
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/balance-info?at=1100000',
		JSON.stringify(accountBalance1100000),
	], // v504
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/balance-info?at=1300000',
		JSON.stringify(accountBalance1300000),
	], // v601
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/balance-info?at=1800000',
		JSON.stringify(accountBalance1800000),
	], // v700
];
