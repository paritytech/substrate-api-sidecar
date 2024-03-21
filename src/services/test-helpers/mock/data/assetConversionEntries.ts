// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import type { StagingXcmV3MultiLocation } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types-codec/types';

import { assetHubWestendRegistryV9435 } from '../../../../test-helpers/registries/assetHubWestendRegistry';

export const reserves: ITuple<[StagingXcmV3MultiLocation, StagingXcmV3MultiLocation]>[] = [];

const native = assetHubWestendRegistryV9435.createType('XcmV3MultiLocation', {
	parents: '0',
	interior: {
		here: null,
	},
});

export const assets = [
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '47',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '1',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '46',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '30',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '32',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '4',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '45',
				},
			],
		},
	},
	{
		parents: '2',
		interior: {
			X1: {
				globalConsensus: { polkadot: null },
			},
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '2511',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '19801204',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '1114',
				},
			],
		},
	},
	{
		parents: '0',
		interior: {
			X2: [
				{
					palletInstance: '50',
				},
				{
					generalIndex: '8',
				},
			],
		},
	},
	{
		parents: '2',
		interior: {
			X1: {
				globalConsensus: { polkadot: null },
			},
		},
	},
];

for (let i = 0; i < assets.length; i++) {
	const reserve = assetHubWestendRegistryV9435.createType('XcmV3MultiLocation', assets[i]);
	reserves.push([native, reserve] as unknown as ITuple<[StagingXcmV3MultiLocation, StagingXcmV3MultiLocation]>);
}
