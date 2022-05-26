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

import runtimeSpec1000 from './1000.json';
import runtimeSpec200000 from './200000.json';
import runtimeSpec3000000 from './3000000.json';
import runtimeSpec6877002 from './6877002.json';

export const polkadotRuntimeSpecEndpoints = [
	['/runtime/spec?at=1000', JSON.stringify(runtimeSpec1000)], // v0
	['/runtime/spec?at=200000', JSON.stringify(runtimeSpec200000)], // v6
	['/runtime/spec?at=3000000', JSON.stringify(runtimeSpec3000000)], // v26
	['/runtime/spec?at=6877002', JSON.stringify(runtimeSpec6877002)], // v9090
];
