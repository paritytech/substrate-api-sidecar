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

import accountsStakingInfo1500000 from './1500000.json';
import accountsStakingInfo3000000 from './3000000.json';
import accountsStakingInfo5000000 from './5000000.json';
import accountsStakingInfo8000000 from './8000000.json';
import accountsStakingInfo9500000 from './9500000.json';
import accountsStakingInfo9894877 from './9894877.json';
import accountsStakingInfo10819301 from './10819301.json';
import accountsStakingInfo11000000 from './11000000.json';
import accountsStakingInfo11100000 from './11100000.json';
import accountsStakingInfo11500000 from './11500000.json';
import accountsStakingInfo11800000 from './11800000.json';

export const kusamaAccountStakingInfoEndpoints = [
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=1500000',
		JSON.stringify(accountsStakingInfo1500000),
	], // v1054
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=3000000',
		JSON.stringify(accountsStakingInfo3000000),
	], // v2012
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=5000000',
		JSON.stringify(accountsStakingInfo5000000),
	], // v2026
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=8000000',
		JSON.stringify(accountsStakingInfo8000000),
	], // v9040
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=9500000',
		JSON.stringify(accountsStakingInfo9500000),
	], // v9090
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=9894877',
		JSON.stringify(accountsStakingInfo9894877),
	], // v9122
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=10819301',
		JSON.stringify(accountsStakingInfo10819301),
	], // v9130
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=11000000',
		JSON.stringify(accountsStakingInfo11000000),
	], // v9150
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=11100000',
		JSON.stringify(accountsStakingInfo11100000),
	], // v9151
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=11500000',
		JSON.stringify(accountsStakingInfo11500000),
	], // v9160
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=11800000',
		JSON.stringify(accountsStakingInfo11800000),
	], // v9170
];
