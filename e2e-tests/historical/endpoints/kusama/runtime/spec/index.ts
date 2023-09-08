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

import runtimeSpec10000 from './10000.json';
import runtimeSpec100000 from './100000.json';
import runtimeSpec2000000 from './2000000.json';
import runtimeSpec4000000 from './4000000.json';
import runtimeSpec8000000 from './8000000.json';

export const kusamaRuntimeSpecEndpoints = [
	['/runtime/spec?at=10000', JSON.stringify(runtimeSpec10000)], // v1020
	['/runtime/spec?at=100000', JSON.stringify(runtimeSpec100000)], // v1028
	['/runtime/spec?at=2000000', JSON.stringify(runtimeSpec2000000)], // v1055
	['/runtime/spec?at=4000000', JSON.stringify(runtimeSpec4000000)], // v2023
	['/runtime/spec?at=8000000', JSON.stringify(runtimeSpec8000000)], // v9040
];
