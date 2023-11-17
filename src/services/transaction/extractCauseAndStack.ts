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

// TODO look into creating a base class for transactions and move this into that base class

import { isToString } from '../../types/util';

export function extractCauseAndStack(err: unknown): {
	cause: unknown;
	stack: string | undefined;
} {
	const cause = err instanceof Error ? err.message : isToString(err) ? err.toString() : err;

	const stack = err instanceof Error ? err.stack : '';

	return { cause, stack };
}
