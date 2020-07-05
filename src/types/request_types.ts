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

/**
 * Request Handler with an :address param
 */
export type RequestHandlerAddress = RequestHandler<Address>;

/**
 * Request Handler with a :number param
 */
export type RequestHandlerNumber = RequestHandler<Num>;

/**
 * Request Handler with an :address and :number param
 */
export type RequestHandlerAddressNumber = RequestHandler<AddressNumber>;

interface Num extends ParamsDictionary {
	number: string;
}

interface Address extends ParamsDictionary {
	address: string;
}

interface AddressNumber extends Address {
	number: string;
}
