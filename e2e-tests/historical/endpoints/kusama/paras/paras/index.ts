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

import parasParas8400000 from './8400000.json';
import parasParas9400000 from './9400000.json';
import parasParas9800000 from './9800000.json';
import parasParas10119301 from './10119301.json';
import parasParas10819301 from './10819301.json';
import parasParas11000000 from './11000000.json';
import parasParas11100000 from './11100000.json';
import parasParas11500000 from './11500000.json';
import parasParas11800000 from './11800000.json';

export const parasParasEndpoints = [
	['/paras?at=8400000', JSON.stringify(parasParas8400000)], // v9070
	['/paras?at=9400000', JSON.stringify(parasParas9400000)], // v9090
	['/paras?at=9800000', JSON.stringify(parasParas9800000)], // v9111
	['/paras?at=10119301', JSON.stringify(parasParas10119301)], // v9122
	['/paras?at=10819301', JSON.stringify(parasParas10819301)], // v9130
	['/paras?at=11000000', JSON.stringify(parasParas11000000)], // v9150
	['/paras?at=11100000', JSON.stringify(parasParas11100000)], // v9151
	['/paras?at=11500000', JSON.stringify(parasParas11500000)], // v9160
	['/paras?at=11800000', JSON.stringify(parasParas11800000)], // v9170
];
