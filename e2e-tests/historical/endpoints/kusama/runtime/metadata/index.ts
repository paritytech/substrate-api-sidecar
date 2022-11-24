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

import runtimeMetadata10000 from './10000.json';
import runtimeMetadata8000000 from './8000000.json';
import runtimeMetadata12470000 from './12470000.json';

export const kusamaRuntimeMetadataEndpoints = [
	['/runtime/metadata?at=10000', JSON.stringify(runtimeMetadata10000)], // v1020
	['/runtime/metadata?at=8000000', JSON.stringify(runtimeMetadata8000000)], // v9040 V13
	['/runtime/metadata?at=12470000', JSON.stringify(runtimeMetadata12470000)], // v9190 V14
];
