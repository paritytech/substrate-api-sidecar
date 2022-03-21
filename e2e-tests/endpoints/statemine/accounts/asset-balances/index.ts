import accountAssetBalance450000 from './450000.json';
import accountAssetBalance650000 from './650000.json';
import accountAssetBalance960000 from './960000.json';
import accountAssetBalance986791 from './986791.json';
import accountAssetBalance1100000 from './1100000.json';
import accountAssetBalance1300000 from './1300000.json';
import accountAssetBalance1800000 from './1800000.json';

export const statemineAccountAssetBalanceEndpoints = [
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?at=450000',
		JSON.stringify(accountAssetBalance450000),
	], // v2
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?at=650000',
		JSON.stringify(accountAssetBalance650000),
	], // v3
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?at=960000',
		JSON.stringify(accountAssetBalance960000),
	], // v4
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?assets[]=11&at=986791',
		JSON.stringify(accountAssetBalance986791),
	], // v5
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?assets[]=11&at=1100000',
		JSON.stringify(accountAssetBalance1100000),
	], // v504
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?assets[]=11&at=1300000',
		JSON.stringify(accountAssetBalance1300000),
	], // v601
	[
		'/accounts/H4DU1hKQeLkR5bhMeMidarF9bVvrH3k6ybLz84YLs7eRQMu/asset-balances?assets[]=11&at=1800000',
		JSON.stringify(accountAssetBalance1800000),
	], // v700
];
