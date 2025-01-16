// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { TransformableInfo } from 'logform';
import { SPLAT } from 'triple-beam';
import { format } from 'util';
import * as winston from 'winston';

/**
 * Console.log style formatting using node's `util.format`. We need this so we
 * can override console.{log, error, etc.} without issue.
 */
export const nodeUtilFormat = winston.format((info: TransformableInfo) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const args = info[SPLAT as unknown as string] as string[];
	if (args) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		info.message = format(info.message as string, ...args);
	}
	return info;
});
