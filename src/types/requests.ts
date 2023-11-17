// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { RequestHandler } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

/**
 * Body for RequestHandlerTx. In other words, the body of a POST route that sends an encoded transaction.
 */
export interface ITx {
	tx: string;
}

/**
 * Body for the RequestHandlerContract. In other words, the body of the POST route that a message to a contract.
 */
export type IBodyContractMetadata = Record<string, unknown>;

/**
 * Post Request - assuming no url params
 */
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export type IPostRequestHandler<T, P = Query> = RequestHandler<ParamsDictionary, unknown, T, P>;

export interface INumberParam extends ParamsDictionary {
	number: string;
}

export interface IAddressParam extends ParamsDictionary {
	address: string;
}

export interface IAddressNumberParams extends IAddressParam {
	number: string;
}

export interface IParaIdParam extends ParamsDictionary {
	paraId: string;
}

export interface IRangeQueryParam extends Query {
	range: string;
}
export interface IPalletsDispatchablesParam extends ParamsDictionary {
	palletId: string;
	dispatchableItemId: string;
}

export interface IContractQueryParam extends Query {
	method: string;
	args: string[];
	gasLimit: string;
	storageDepositLimit: string;
}

export interface IPalletsConstantsParam extends ParamsDictionary {
	palletId: string;
	constantItemId: string;
}

export interface IPalletsErrorsParam extends ParamsDictionary {
	palletId: string;
	errorItemId: string;
}

export interface IPalletsEventsParam extends ParamsDictionary {
	palletId: string;
	eventItemId: string;
}

export interface IPalletsStorageParam extends ParamsDictionary {
	palletId: string;
	storageItemId: string;
}

export interface IPalletsStorageQueryParam extends Query {
	keys: string[];
	metadata: string;
}

export interface IConvertQueryParams extends Query {
	scheme: string;
	prefix: string;
	publicKey: string;
}
