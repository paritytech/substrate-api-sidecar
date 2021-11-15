import parasAuctionsCurrent8400000 from './8400000.json';
import parasAuctionsCurrent9828507 from './9828507.json';

export const parasAuctionsCurrentEndpoints = [
	[
		'/paras/auctions/current?at=8400000',
		JSON.stringify(parasAuctionsCurrent8400000),
	],
	[
		'/paras/auctions/current?at=9828507',
		JSON.stringify(parasAuctionsCurrent9828507),
	],
];
