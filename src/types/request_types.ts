import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

export type TxRequestBody = {
	tx: string;
};

export type TxRequest = Request<ParamsDictionary, any, TxRequestBody, Query>;
