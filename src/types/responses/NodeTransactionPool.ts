interface IPoolExtrinsic {
	hash: string;
	encodedExtrinsic: string;
}

export interface INodeTransactionPool {
	pool: IPoolExtrinsic[];
}
