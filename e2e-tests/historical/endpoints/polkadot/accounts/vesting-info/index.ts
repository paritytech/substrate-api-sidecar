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

import accountVestingInfo1448 from './1448.json';
import accountVestingInfo10254 from './10254.json';
import accountVestingInfo111170 from './111170.json';
import accountVestingInfo213327 from './213327.json';
import accountVestingInfo2413527 from './2413527.json';
import accountVestingInfo4353425 from './4353425.json';
import accountVestingInfo6413249 from './6413249.json';
import accountVestingInfo7232861 from './7232861.json';
import accountVestingInfo8000000 from './8000000.json';
import accountVestingInfo8320000 from './8320000.json';
import accountVestingInfo8500000 from './8500000.json';
import accountVestingInfo9000000 from './9000000.json';
import accountVestingInfo9500000 from './9500000.json';

export const polkadotAccountVestingInfoEndpoints = [
	[
		'/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=1448',
		JSON.stringify(accountVestingInfo1448),
	], // v0
	[
		'/accounts/123PewK4ZYcX7Do8PKzP4KyYbLKMQAAA3EhhZcnBDrxAuidt/vesting-info?at=10254',
		JSON.stringify(accountVestingInfo10254),
	], // v0
	[
		'/accounts/16FQxY2L9GbBoE1jYCDRUkJRroYMu5FsKRQfFi29xueu1egj/vesting-info?at=111170',
		JSON.stringify(accountVestingInfo111170),
	], // v1
	[
		'/accounts/1BjwMkGfudp4eVAMpqv6CHZJxGsLFkqQv5oaZT9gWc5o7hn/vesting-info?at=213327',
		JSON.stringify(accountVestingInfo213327),
	], // v6
	[
		'/accounts/1BjwMkGfudp4eVAMpqv6CHZJxGsLFkqQv5oaZT9gWc5o7hn/vesting-info?at=2413527',
		JSON.stringify(accountVestingInfo2413527),
	], // v25
	[
		'/accounts/123PewK4ZYcX7Do8PKzP4KyYbLKMQAAA3EhhZcnBDrxAuidt/vesting-info?at=4353425',
		JSON.stringify(accountVestingInfo4353425),
	], // v29
	[
		'/accounts/16FQxY2L9GbBoE1jYCDRUkJRroYMu5FsKRQfFi29xueu1egj/vesting-info?at=6413249',
		JSON.stringify(accountVestingInfo6413249),
	], // v9080
	[
		'/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=7232861',
		JSON.stringify(accountVestingInfo7232861),
	], // v9110
	[
		'/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=8000000',
		JSON.stringify(accountVestingInfo8000000),
	], // v9122
	[
		'/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=8320000',
		JSON.stringify(accountVestingInfo8320000),
	], // v9130
	[
		'/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=8500000',
		JSON.stringify(accountVestingInfo8500000),
	], // v9140
	[
		'/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=9000000',
		JSON.stringify(accountVestingInfo9000000),
	], // v9151
	[
		'/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=9500000',
		JSON.stringify(accountVestingInfo9500000),
	], // v9170
];
