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

import parasCrowdloanInfo8367200 from './8367200.json';
import parasCrowdloanInfo9000000 from './9000000.json';
import parasCrowdloanInfo9810000 from './9810000.json';
import parasCrowdloanInfo10119301 from './10119301.json';
import parasCrowdloanInfo10819301 from './10819301.json';
import parasCrowdloanInfo11000000 from './11000000.json';
import parasCrowdloanInfo11100000 from './11100000.json';
import parasCrowdloanInfo11500000 from './11500000.json';
import parasCrowdloanInfo11800000 from './11800000.json';

export const parasCrowdloanInfoEndpoints = [
	['/paras/2023/crowdloan-info?at=8367200', JSON.stringify(parasCrowdloanInfo8367200)], // v9070
	['/paras/2077/crowdloan-info?at=9000000', JSON.stringify(parasCrowdloanInfo9000000)], // v9090
	['/paras/2077/crowdloan-info?at=9810000', JSON.stringify(parasCrowdloanInfo9810000)], // v9111
	['/paras/2077/crowdloan-info?at=10119301', JSON.stringify(parasCrowdloanInfo10119301)], // v9122
	['/paras/2008/crowdloan-info?at=10819301', JSON.stringify(parasCrowdloanInfo10819301)], // v9130
	['/paras/2096/crowdloan-info?at=11000000', JSON.stringify(parasCrowdloanInfo11000000)], // v9150
	['/paras/2096/crowdloan-info?at=11100000', JSON.stringify(parasCrowdloanInfo11100000)], // v9151
	['/paras/2096/crowdloan-info?at=11500000', JSON.stringify(parasCrowdloanInfo11500000)], // v9160
	['/paras/2096/crowdloan-info?at=11800000', JSON.stringify(parasCrowdloanInfo11800000)], // v9170
];
