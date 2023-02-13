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

import accountBalance20000 from './20000.json';
import accountBalance198702 from './198702.json';
import accountBalance2282256 from './2282256.json';
import accountBalance3574738 from './3574738.json';
import accountBalance4574738 from './4574738.json';
import accountBalance6574738 from './6574738.json';
import accountBalance7241122 from './7241122.json';
import accountBalance8000000 from './8000000.json';
import accountBalance8320000 from './8320000.json';
import accountBalance8500000 from './8500000.json';
import accountBalance9000000 from './9000000.json';
import accountBalance9500000 from './9500000.json';

export const polkadotAccountBalanceEndpoints = [
	[
		'/accounts/1KvKReVmUiTc2LW2a4qyHsaJJ9eE9LRsywZkMk5hyBeyHgw/balance-info?at=20000',
		JSON.stringify(accountBalance20000),
	], // v0
	[
		'/accounts/1KvKReVmUiTc2LW2a4qyHsaJJ9eE9LRsywZkMk5hyBeyHgw/balance-info?at=198702',
		JSON.stringify(accountBalance198702),
	], // v5
	[
		'/accounts/14Kq2Gt4buLr8XgRQmLtbWLHkejmhvGhiZDqLEzWcbe7jQTU/balance-info?at=2282256',
		JSON.stringify(accountBalance2282256),
	], // v25
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=3574738',
		JSON.stringify(accountBalance3574738),
	], // v26
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=4574738',
		JSON.stringify(accountBalance4574738),
	], // v29
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=6574738',
		JSON.stringify(accountBalance6574738),
	], // v9080
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=7241122',
		JSON.stringify(accountBalance7241122),
	], // v9110
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8000000',
		JSON.stringify(accountBalance8000000),
	], // v9122
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8320000',
		JSON.stringify(accountBalance8320000),
	], // v9130
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8500000',
		JSON.stringify(accountBalance8500000),
	], // v9140
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=9000000',
		JSON.stringify(accountBalance9000000),
	], // v9151
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=9500000',
		JSON.stringify(accountBalance9500000),
	], // v9170
];
