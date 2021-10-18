import accountAssetBalance450000 from './450000.json';
import accountAssetBalance986791 from './986791.json';

export const statemintAccountAssetEndpoints = [
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?assets[]=11&at=986791',
		JSON.stringify(accountAssetBalance986791),
	],
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?at=450000',
		JSON.stringify(accountAssetBalance450000),
	],
];
