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

import accountBalance1191 from './1191.json';
import accountBalance1000000 from './1000000.json';
import accountBalance4000000 from './4000000.json';
import accountBalance7245493 from './7245493.json';

export const westendAccountBalanceEndpoints = [
	[
		'/accounts/5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR/balance-info?at=1191',
		JSON.stringify(accountBalance1191),
	], // v1
	[
		'/accounts/5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR/balance-info?at=1000000',
		JSON.stringify(accountBalance1000000),
	], // v29
	[
		'/accounts/5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR/balance-info?at=4000000',
		JSON.stringify(accountBalance4000000),
	], // v47
	[
		'/accounts/5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR/balance-info?at=7245493',
		JSON.stringify(accountBalance7245493),
	], // v9090
];
