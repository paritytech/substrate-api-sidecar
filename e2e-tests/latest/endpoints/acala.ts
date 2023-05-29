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

import { IConfig } from '../types/endpoints';

export const acala: IConfig = {
	'/blocks': {
		path: '/blocks?range=3000000-3000005',
		queryParams: [],
	},
	'/blocks/{blockId}': {
		path: '/blocks/{blockId}',
		queryParams: ['eventDocs=true', 'extrinsicDocs=true'],
	},
	'/blocks/{blockId}/header': {
		path: '/blocks/{blockId}/header',
		queryParams: [],
	},
	'/blocks/{blockId}/extrinsics/{extrinsicIndex}': {
		path: `/blocks/{blockId}/extrinsics/0`,
		queryParams: ['eventDocs=true', 'extrinsicDocs=true'],
	},
	'/blocks/head': {
		path: `/blocks/head`,
		queryParams: ['eventDocs=true', 'extrinsicDocs=true'],
	},
	'/blocks/head/header': {
		path: '/blocks/head',
		queryParams: [],
	},
	'/node/network': {
		path: '/node/network',
		queryParams: [],
	},
	'/node/transaction-pool': {
		path: '/node/transaction-pool',
		queryParams: ['includeFee=true'],
	},
	'/node/version': {
		path: '/node/version',
		queryParams: [],
	},
	'/pallets/{palletId}/storage': {
		path: '/pallets/System/storage',
		queryParams: ['onlyIds=true', 'at={blockId}'],
	},
	'/pallets/{palletId}/storage/{storageItemId}': {
		path: '/pallets/System/storage/BlockWeight',
		queryParams: ['metadata=true', 'at={blockId}'],
	},
	'/runtime/metadata': {
		path: '/runtime/metadata',
		queryParams: ['at={blockId}'],
	},
	'/runtime/code': {
		path: '/runtime/code',
		queryParams: ['at={blockId}'],
	},
	'/runtime/spec': {
		path: '/runtime/spec',
		queryParams: ['at={blockId}'],
	},
	'/transaction/material': {
		path: '/transaction/material',
		queryParams: [],
	},
};
