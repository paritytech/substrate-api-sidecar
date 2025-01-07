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

/**
 * Verify all integers including zeroes.
 * @param num
 */
export const verifyUInt = (num: number): boolean => {
	return Number.isInteger(num) && num >= 0;
};

/**
 * Verify all integers except for zero. Will return false when zero is inputted.
 * @param num
 */
export const verifyNonZeroUInt = (num: number): boolean => {
	return Number.isInteger(num) && num > 0;
};
