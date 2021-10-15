import accountBalance10000 from './10000.json';
import accountBalance1355087 from './1355087.json';
import accountBalance1455087 from './1455087.json';
import accountBalance1655087 from './1655087.json';
import accountBalance8990000 from './8990000.json';
import accountBalance9625229 from './9625229.json';

/**
 * When it comes to kusama there are 3 major storage formats we are testing.
 *
 * Runtimes < 1050
 * Runtimes >= 1050 < 1055
 * Runtimes >= 1055
 */
export const kusamaAccountBalanceEndpoints = [
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=10000',
		JSON.stringify(accountBalance10000),
	], // v1020
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=1355087',
		JSON.stringify(accountBalance1355087),
	], //v1045
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=1455087',
		JSON.stringify(accountBalance1455087),
	], //v1051
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=1655087',
		JSON.stringify(accountBalance1655087),
	], //v1055
	[
		'/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=8990000',
		JSON.stringify(accountBalance8990000),
	], //v9090
	[
		`/accounts/CdA6gJUJRAZadvkZ2XHyaiunC7hhgY1MaWQ7A7b3dfLQHMk/balance-info?at=9625229`,
		JSON.stringify(accountBalance9625229),
	], //v9110
];
