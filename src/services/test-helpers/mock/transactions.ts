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

/**
 * balances.transfer from Alice to Bob constructed using the txwrapper polkadot
 * example.
 */
export const balancesTransferValid =
	'0x250284d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d01022f4deae1532ddd01b88c4897151447ecfad96e18cf91088716a29ed00a6f514c56612f92650f66df1719a04935ce0b9c23b07ed81ae038844e33ee733bd588a501000005008eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a4830';

/**
 * Same as `balancesTransferValid` but with back half cut off.
 */
export const balancesTransferInvalid =
	'0x250284d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d01022f4deae1532ddd0';
