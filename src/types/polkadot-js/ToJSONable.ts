export interface IToJSONable {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toJSON: () => any;
}

export function isToJSONable(thing: unknown): thing is IToJSONable {
	return typeof (thing as IToJSONable).toJSON === 'function';
}
