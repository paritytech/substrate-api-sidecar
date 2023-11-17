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

import validateWestendHex from './validateWestendHex.json';
import validateWestendSS58 from './validateWestendSS58.json';

export const westendAccountValidateEndpoints = [
	['/accounts/5CdnmxQUfK6WPreBauvetcLh5PZL4RMPHrtd3nPQpQ9Z2qCS/validate', JSON.stringify(validateWestendSS58)],
	[
		'/accounts/0x2a193ba804b76499944080c91b8b38b749a482471c317ab8bfa43f52d5ff9c04c7f6bf/validate',
		JSON.stringify(validateWestendHex),
	],
];
