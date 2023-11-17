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

import validateKusamaHex from './validateKusamaHex.json';
import validateKusamaSS58 from './validateKusamaSS58.json';

export const kusamaAccountValidateEndpoints = [
	['/accounts/DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc/validate', JSON.stringify(validateKusamaSS58)],
	[
		'/accounts/0x02ce046d43fc4c0fb8b3b754028515e5020f5f1d8d620b4ef0f983c5df34b1952909e9/validate',
		JSON.stringify(validateKusamaHex),
	],
];
