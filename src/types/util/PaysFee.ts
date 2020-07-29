export interface IPaysFee {
	paysFee: unknown;
}

export function isPaysFee(thing: unknown): thing is IPaysFee {
	return !!(thing as IPaysFee)?.paysFee;
}
