// Copyright 2017-2026 Parity Technologies (UK) Ltd.
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

import { IAt } from './At';

export interface IDeprecationInfo {
	type: 'NotDeprecated' | 'DeprecatedWithoutNote' | 'Deprecated';
	note: string | null;
	since: string | null;
}

interface IRuntimeApiMethodInput {
	name: string;
	id: string;
	typeId: string;
	type: string;
}

interface IRuntimeApiMethodOutput {
	typeId: string;
	type: string;
}

export interface IRuntimeApiMethod {
	name: string;
	id: string;
	docs: string;
	inputs: IRuntimeApiMethodInput[];
	output: IRuntimeApiMethodOutput;
	deprecationInfo: IDeprecationInfo | null;
}

export interface IRuntimeApiDescription {
	name: string;
	id: string;
	docs: string;
	version: number | null;
	deprecationInfo: IDeprecationInfo | null;
	methods: IRuntimeApiMethod[];
}

interface IRuntimeApiSummary {
	name: string;
	id: string;
	docs: string;
	methodCount: number;
	methods: {
		name: string;
		id: string;
	}[];
}

export interface IRuntimeApis {
	at: IAt;
	apis: IRuntimeApiSummary[];
}

export interface IRuntimeApi {
	at: IAt;
	api: IRuntimeApiDescription;
}

export interface IRuntimeApiCall {
	at: IAt;
	api: {
		name: string;
		id: string;
	};
	method: {
		name: string;
		id: string;
	};
	result: unknown;
}
