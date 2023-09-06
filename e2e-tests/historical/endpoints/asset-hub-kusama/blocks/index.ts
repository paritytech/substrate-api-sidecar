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

import block450000 from './450000.json';
import block650000 from './650000.json';
import block960000 from './960000.json';
import block993540 from './993450.json';
import block1100000 from './1100000.json';
import block1300000 from './1300000.json';
import block1800000 from './1800000.json';

export const assetHubKusamaBlockEndpoints = [
	['/blocks/450000', JSON.stringify(block450000)], // v2
	['/blocks/650000', JSON.stringify(block650000)], // v3
	['/blocks/960000', JSON.stringify(block960000)], // v4
	['/blocks/993540', JSON.stringify(block993540)], // v5
	['/blocks/1100000', JSON.stringify(block1100000)], // v504
	['/blocks/1300000', JSON.stringify(block1300000)], // v601
	['/blocks/1800000', JSON.stringify(block1800000)], // v700
];
