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

import parasAuctionsCurrent8351749 from './8351749.json';
import parasAuctionsCurrent8400000 from './8400000.json';
import parasAuctionsCurrent8423750 from './8423750.json';
import parasAuctionsCurrent9828507 from './9828507.json';
import parasAuctionsCurrent9905872 from './9905872.json';
import parasAuctionsCurrent11115599 from './11115599.json';
import parasAuctionsCurrent11187599 from './11187599.json';
import parasAuctionsCurrent11500000 from './11500000.json';
import parasAuctionsCurrent11590799 from './11590799.json';
import parasAuctionsCurrent11800000 from './11800000.json';
import parasAuctionsCurrent11821201 from './11821201.json';

export const parasAuctionsCurrentEndpoints = [
	['/paras/auctions/current?at=8351749', JSON.stringify(parasAuctionsCurrent8351749)], // v9070 - startPeriod
	['/paras/auctions/current?at=8400000', JSON.stringify(parasAuctionsCurrent8400000)], // v9070 - endingPeriod
	['/paras/auctions/current?at=8423750', JSON.stringify(parasAuctionsCurrent8423750)], // v9070 - vrfDelay (Only need to check this case once)
	['/paras/auctions/current?at=9828507', JSON.stringify(parasAuctionsCurrent9828507)], // v9111 - startPeriod
	['/paras/auctions/current?at=9905872', JSON.stringify(parasAuctionsCurrent9905872)], // v9111 - endingPeriod
	['/paras/auctions/current?at=11115599', JSON.stringify(parasAuctionsCurrent11115599)], // v9151 - startPeriod
	['/paras/auctions/current?at=11187599', JSON.stringify(parasAuctionsCurrent11187599)], // v9151 - endingPeriod
	['/paras/auctions/current?at=11500000', JSON.stringify(parasAuctionsCurrent11500000)], // v9160 - startingPeriod
	['/paras/auctions/current?at=11590799', JSON.stringify(parasAuctionsCurrent11590799)], // v9160 - endingPeriod
	['/paras/auctions/current?at=11800000', JSON.stringify(parasAuctionsCurrent11800000)], // v9170 - startingPeriod
	['/paras/auctions/current?at=11821201', JSON.stringify(parasAuctionsCurrent11821201)], // v9170 - endingPeriod
];
