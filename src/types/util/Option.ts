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
