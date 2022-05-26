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

import parasCrowdloans8200000 from './8200000.json';
import parasCrowdloans9800000 from './9800000.json';
import parasCrowdloans10119301 from './10119301.json';
import parasCrowdloans10819301 from './10819301.json';
import parasCrowdloans11000000 from './11000000.json';
import parasCrowdloans11100000 from './11100000.json';
import parasCrowdloans11500000 from './11500000.json';
import parasCrowdloans11800000 from './11800000.json';

export const parasCrowdloansEndpoints = [
	['/paras/crowdloans?at=8200000', JSON.stringify(parasCrowdloans8200000)], // v9070
	['/paras/crowdloans?at=9800000', JSON.stringify(parasCrowdloans9800000)], // v9111
	['/paras/crowdloans?at=10119301', JSON.stringify(parasCrowdloans10119301)], // v9122
	['/paras/crowdloans?at=10819301', JSON.stringify(parasCrowdloans10819301)], // v9130
	['/paras/crowdloans?at=11000000', JSON.stringify(parasCrowdloans11000000)], // v9150
	['/paras/crowdloans?at=11100000', JSON.stringify(parasCrowdloans11100000)], // v9151
	['/paras/crowdloans?at=11500000', JSON.stringify(parasCrowdloans11500000)], // v9160
	['/paras/crowdloans?at=11800000', JSON.stringify(parasCrowdloans11800000)], // v9170
];
