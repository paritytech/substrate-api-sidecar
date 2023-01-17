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

import block3032259 from './3032259.json';
import block3813629 from './3813629.json';
import block3889918 from './3889918.json';
import block4781573 from './4781573.json';
import block5277929 from './5277929.json';
import block5480769 from './5480769.json';
import block5493461 from './5493461.json';
import block5495855 from './5495855.json';
import block5657482 from './5657482.json';
import block6200000 from './6200000.json';
import block6800000 from './6800000.json';
import block7200000 from './7200000.json';
import block7600000 from './7600000.json';
import block7800000 from './7800000.json';
import block8000000 from './8000000.json';

export const westendBlockEndpoints = [
	['/blocks/3032259', JSON.stringify(block3032259)], //v45
	['/blocks/3813629', JSON.stringify(block3813629)], //v45
	['/blocks/3889918', JSON.stringify(block3889918)], //v45
	['/blocks/4781573', JSON.stringify(block4781573)], //v49
	['/blocks/5277929', JSON.stringify(block5277929)], //v50
	['/blocks/5480769', JSON.stringify(block5480769)], //v9000
	['/blocks/5493461', JSON.stringify(block5493461)], //v9000
	['/blocks/5495855', JSON.stringify(block5495855)], //v9000
	['/blocks/5657482', JSON.stringify(block5657482)], //v9010
	['/blocks/6200000', JSON.stringify(block6200000)], //v9050
	['/blocks/6800000', JSON.stringify(block6800000)], //v9080
	['/blocks/7200000', JSON.stringify(block7200000)], //v9090
	['/blocks/7600000', JSON.stringify(block7600000)], //v9100
	['/blocks/7800000', JSON.stringify(block7800000)], //v9111
	['/blocks/8000000', JSON.stringify(block8000000)], //v9122
];
