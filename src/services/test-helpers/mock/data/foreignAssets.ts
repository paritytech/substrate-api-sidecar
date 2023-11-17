// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

const foreignAssetsLocation1 = {
	parents: '2',
	interior: {
		X1: { GlobalConsensus: 'Polkadot' },
	},
};

const foreignAssetsLocation2 = {
	parents: '1',
	interior: {
		X2: [{ Parachain: '2,125' }, { GeneralIndex: '0' }],
	},
};

export const foreignAssetsLocations = [foreignAssetsLocation1, foreignAssetsLocation2];
