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

import runtimeMetadata100000 from './100000.json';
import runtimeMetadata6877002 from './6877002.json';
import runtimeMetadata10090000 from './10090000.json';

export const polkadotRuntimeMetadataEndpoints = [
	['/runtime/metadata?at=100000', JSON.stringify(runtimeMetadata100000)], // v1
	['/runtime/metadata?at=6877002', JSON.stringify(runtimeMetadata6877002)], // v9090 V13
	['/runtime/metadata?at=10090000', JSON.stringify(runtimeMetadata10090000)], // v9180 V14
];
