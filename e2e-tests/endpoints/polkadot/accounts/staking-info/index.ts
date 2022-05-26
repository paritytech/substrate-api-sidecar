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

import accountsStakingInfo350000 from './350000.json';
import accountsStakingInfo1000000 from './1000000.json';
import accountsStakingInfo3000000 from './3000000.json';
import accountsStakingInfo6000000 from './6000000.json';
import accountsStakingInfo7000000 from './7000000.json';
import accountsStakingInfo7472552 from './7472552.json';
import accountsStakingInfo8000000 from './8000000.json';
import accountsStakingInfo8320000 from './8320000.json';
import accountsStakingInfo8500000 from './8500000.json';
import accountsStakingInfo9000000 from './9000000.json';
import accountsStakingInfo9500000 from './9500000.json';

export const polkadotAccountStakingInfoEndpoints = [
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=350000',
		JSON.stringify(accountsStakingInfo350000),
	], // v11
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=1000000',
		JSON.stringify(accountsStakingInfo1000000),
	], // v17
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=3000000',
		JSON.stringify(accountsStakingInfo3000000),
	], // v26
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=6000000',
		JSON.stringify(accountsStakingInfo6000000),
	], // v9050
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=7000000',
		JSON.stringify(accountsStakingInfo7000000),
	], // v9090
	[
		'/accounts/13HtFCrxyz55KgkPWcnhHPwE8f8GmZrfXR3uC6jNrihGzmqz/staking-info?at=7472552',
		JSON.stringify(accountsStakingInfo7472552),
	], // v9110
	[
		'/accounts/13HtFCrxyz55KgkPWcnhHPwE8f8GmZrfXR3uC6jNrihGzmqz/staking-info?at=8000000',
		JSON.stringify(accountsStakingInfo8000000),
	], // v9122
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=8320000',
		JSON.stringify(accountsStakingInfo8320000),
	], // v9130
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=8500000',
		JSON.stringify(accountsStakingInfo8500000),
	], // v9140
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=9000000',
		JSON.stringify(accountsStakingInfo9000000),
	], // v9151
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=9500000',
		JSON.stringify(accountsStakingInfo9500000),
	], // v9170
];
