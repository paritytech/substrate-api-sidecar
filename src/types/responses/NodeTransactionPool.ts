interface IPoolExtrinsic {
	/**
	 * H256 hash of the extrinsic
	 */
	hash: string;
	/**
	 * SCALE encoded extrinsic
	 */
	encodedExtrinsic: string;
	/**
	 * The tip within an extrinsic. Available when the `tip` query parameter
	 * for `/node/transaction-pool` is set to true.
	 */
	tip?: string;
	partialFee?: string;
	totalFee?: string;
}

export interface INodeTransactionPool {
	pool: IPoolExtrinsic[];
}
