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

import { format } from 'winston';

import { ITransformableInfo } from '../../types/logging';

/**
 * Regex that matches timestamps with the format of `YYYY-MM-DD HH:MM`
 */
const timestampRegex = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/;

/**
 * Slice out the timestamp from a message so it is not redundant with the winston
 * timestamp. This is for the polkadot-js console statements.
 */
export const stripTimestamp = format((info: ITransformableInfo, _opts: unknown) => {
	if (timestampRegex.exec(info?.message)) {
		info.message = info.message.slice(24).trim();
	}

	return info;
});
