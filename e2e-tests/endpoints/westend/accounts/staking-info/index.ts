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

import accountsStakingInfo6000000 from './6000000.json';
import accountsStakingInfo8041521 from './8041521.json';

export const westendAccountStakingInfoEndpoints = [
	[
		'/accounts/5Ek5JCnrRsyUGYNRaEvkufG1i1EUxEE9cytuWBBjA9oNZVsf/staking-info?at=6000000',
		JSON.stringify(accountsStakingInfo6000000),
	], // v9033
	[
		'/accounts/5ENXqYmc5m6VLMm5i1mun832xAv2Qm9t3M4PWAFvvyCJLNoR/staking-info?at=8041521',
		JSON.stringify(accountsStakingInfo8041521),
	], // v9122
];
