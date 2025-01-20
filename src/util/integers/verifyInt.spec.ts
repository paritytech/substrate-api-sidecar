// Copyright 2022-2025 Parity Technologies (UK) Ltd.
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

import { verifyNonZeroUInt, verifyUInt } from './verifyInt';

describe('Verify integers', () => {
	describe('verifyUInt', () => {
		it('Should correctly handle unsigned integers correctly', () => {
			expect(verifyUInt(0)).toBe(true);
			expect(verifyUInt(1)).toBe(true);
			expect(verifyUInt(-1)).toBe(false);
		});
	});

	describe('verifyNonZeroUInt', () => {
		it('Should correctly handle unsigned integers correctly', () => {
			expect(verifyNonZeroUInt(1)).toBe(true);
			expect(verifyNonZeroUInt(0)).toBe(false);
			expect(verifyNonZeroUInt(-1)).toBe(false);
		});
	});
});
