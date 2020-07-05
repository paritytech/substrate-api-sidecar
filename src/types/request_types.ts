import { RequestHandler } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

/**
 * Body for RequestHandlerTx. In other words, the body of a POST route that send a Tx.
 */
export type TxRequestBody = {
	tx: string;
};

/**
 * Request for a tx submission
 */
export type RequestHandlerTx = RequestHandler<
	ParamsDictionary,
	unknown,
	TxRequestBody,
	Query
>;

export interface NumberParam extends ParamsDictionary {
	number: string;
}

export interface AddressParam extends ParamsDictionary {
	address: string;
}

export interface AddressNumberParams extends AddressParam {
	number: string;
}
