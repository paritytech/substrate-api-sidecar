import { RequestHandler } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

/**
 * Body for RequestHandlerTx. In other words, the body of a POST route that sends an encoded transaction.
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

export interface INumberParam extends ParamsDictionary {
	number: string;
}

export interface IAddressParam extends ParamsDictionary {
	address: string;
}

export interface IAddressNumberParams extends IAddressParam {
	number: string;
}
