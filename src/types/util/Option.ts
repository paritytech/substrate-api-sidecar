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

// Not to be confused with the polkadot-js `Codec` extending `Option` type.
export type IOption<T> = T | null;

/**
 * Check if a `IOption` is `T`.
 *
 * @param option api-sidecar TS option type, conceptually mimics Rust option
 */
export function isSome<T>(option: IOption<T>): option is T {
	return option !== null;
}

/**
 * Check if a something is null. Meant to complement `isSome` for `IOption`.
 *
 * @param thing unknown value
 */
export function isNull(thing: unknown): thing is null {
	return thing === null;
}
