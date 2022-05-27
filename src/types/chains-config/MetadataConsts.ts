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

/**
 * Given an extrinsic that is going to be sanitized. It is given one of the
 * weight types for calculating fees.
 */
export type WeightValue = ExtBaseWeightValue | PerClassValue;

/**
 * Polkadot runtime versions before v27
 * Kusama runtime versions before v2027
 */
export interface ExtBaseWeightValue {
	extrinsicBaseWeight?: BigInt;
}

export function isExtBaseWeightValue(
	thing: unknown
): thing is ExtBaseWeightValue {
	return typeof (thing as ExtBaseWeightValue)?.extrinsicBaseWeight === 'bigint';
}

/**
 * Polkadot runtime versions after v26
 * Kusama runtime versions after v2026
 */
export interface PerClassValue {
	perClass: IPerClass;
}

export function isPerClassValue(thing: unknown): thing is PerClassValue {
	return (
		typeof (thing as PerClassValue)?.perClass?.normal.baseExtrinsic ===
			'bigint' &&
		typeof (thing as PerClassValue)?.perClass?.operational.baseExtrinsic ===
			'bigint' &&
		typeof (thing as PerClassValue)?.perClass?.mandatory.baseExtrinsic ===
			'bigint'
	);
}

export interface IPerClass {
	normal: IWeightPerClass;
	mandatory: IWeightPerClass;
	operational: IWeightPerClass;
}

export interface IWeightPerClass {
	baseExtrinsic: BigInt;
}
