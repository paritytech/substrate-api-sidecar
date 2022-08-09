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
 * Regex pattern to match ANSI characters.
 */
const pattern = [
	'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
	'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
].join('|');

/**
 * RegExp for global matching ANSI characters.
 */
const ansiRegex = new RegExp(pattern, 'g');

/**
 * Strip ANSI characters from strings in simple, arbitrary data. N.B. this is not
 * hardened to work with any possible javascript type and is only meant for arrays,
 * basic objects and strings.
 *
 * @param data arbitrary data
 */
function stripAnsiShellCodes(data: unknown): unknown {
	if (data === null || data === undefined) {
		return data;
	}

	if (typeof data === 'string') {
		return data.replace(ansiRegex, '');
	}

	if (Array.isArray(data)) {
		return data.map((val) => stripAnsiShellCodes(val));
	}

	if (typeof data === 'object' && data !== null) {
		const sanitizedData = {};
		for (const [k, v] of Object.entries(data)) {
			sanitizedData[k] = stripAnsiShellCodes(v);
		}
		return sanitizedData;
	}

	return data;
}

/**
 * Strip ANSI characters from `TransformableInfo.message`.
 */
export const stripAnsi = format((info: ITransformableInfo, _opts: unknown) => {
	info.message = stripAnsiShellCodes(info.message) as string;
	return info;
});
