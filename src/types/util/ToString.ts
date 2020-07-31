export interface IToString {
	toString: () => string;
}

export function isToString(thing: unknown): thing is IToString {
	return typeof (thing as IToString) === 'function';
}
