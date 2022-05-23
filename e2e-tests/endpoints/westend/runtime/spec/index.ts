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

import runtimeSpec10000 from './10000.json';
import runtimeSpec2000000 from './2000000.json';
import runtimeSpec7417678 from './7417678.json';

export const westendRuntimeSpecEndpoints = [
	['/runtime/spec?at=10000', JSON.stringify(runtimeSpec10000)], // v1
	['/runtime/spec?at=2000000', JSON.stringify(runtimeSpec2000000)], // v41
	['/runtime/spec?at=7417678', JSON.stringify(runtimeSpec7417678)], // v9090
];
