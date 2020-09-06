export interface IFrameMethod {
	pallet: string;
	method: string;
}

export function isFrameMethod(thing: unknown): thing is IFrameMethod {
	return (
		typeof (thing as IFrameMethod).pallet === 'string' &&
		typeof (thing as IFrameMethod).method === 'string'
	);
}
